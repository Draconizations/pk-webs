import React, { useState, useEffect } from "react";
import * as BS from "react-bootstrap";
import autosize from "autosize";
import "moment-timezone";
import Popup from "reactjs-popup";
import twemoji from 'twemoji';

import history from "../../History.js";
import defaultAvatar from "../../default_discord_avatar.png";
import { FaAddressCard } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import moment from 'moment';
import API_URL from '../../Constants/constants'

export default function System() {

	// get the user from the localstorage
	const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

	// bunch of useState stuff, used in the useEffect() hook below
	const [name, setName] = useState("");
	const [tag, setTag] = useState("");
	const [timezone, setTimezone] = useState("");
	const [avatar, setAvatar] = useState("");
	const [banner, setBanner] = useState("");
	const [desc, setDesc] = useState("");
	const [editDesc, setEditDesc] = useState("");

	// more useState, this time to actually handle state
	// TODO: name them something more intuitive maybe?
	const [editMode, setEditMode] = useState(false);
	const [privacyEdit, setPrivacyEdit] = useState(false);
	const [privacyView, setPrivacyView] = useState(false);

	const [errorAlert, setErrorAlert] = useState(false);
	const [ errorMessage, setErrorMessage ] = useState("");

	// this useEffect does a couple of things after the user is gotten from localstorage
	useEffect(() => {
		// first require the discord markdown parser
		const { toHTML } = require("../../Functions/discord-parser.js");

		// check if there's a name object in user, if it's null, set name to a blank string, otherwise set name to user.name
		if (user.name) {
			setName(user.name);
		} else setName("");

		// same as above, but with the user tag instead
		if (user.tag) {
			setTag(user.tag);
		} else setTag("");

		// same as above but with timezone
		if (user.tz) {
			setTimezone(user.tz);
		} else setTimezone("");

		// also trims the avatar url so that 1. pngs won't be converted to jpegs and 2. won't be resized to 256x256
		if (user.avatar_url) {
			var avatarsmall = user.avatar_url.replace("&format=jpeg", "");
			setAvatar(avatarsmall.replace("?width=256&height=256", ""));
		} else setAvatar("");

		if (user.banner) {
			setBanner(user.banner);
		} else setBanner("");

		// same as above, but with descriptions
		// two description variables! one is just the plain description, the other is parsed and converted to html
		if (user.description) {
			setDesc(toHTML(user.description));
			setEditDesc(user.description);
		} else {
			setDesc("(no description)");
			setEditDesc("");
		}
	}, [user.description, user.tag, user.avatar_url, user.tz, user.name, user.banner]);

	// this just resizes the textarea when filled with larger amounts of text
	useEffect(() => {
		autosize(document.querySelector("textarea"));
	});

	const [invalidTimezone, setInvalidTimezone] = useState(false);

	const { register: registerEdit, handleSubmit: handleSubmitEdit } = useForm();

	const submitEdit = (data) => {
	if (data.tz) {
		if (!moment.tz.zone(data.tz)) {
		setInvalidTimezone(true);
		return;
		}
	}
	fetch(`${API_URL}s`, {
		method: "PATCH",
		body: JSON.stringify(data),
		headers: {
		"Content-Type": "application/json",
		Authorization: localStorage.getItem("token"),
		},
	})
		.then((res) => {
		if (!res.ok)
			throw new Error('HTTP Status ' + res.status)
		return res.json();
		})
		.then(() => {
		setUser((prevState) => {
			return { ...prevState, ...data };
		});
		localStorage.setItem("user", JSON.stringify(user));
		setEditMode(false);
		})
		.catch((error) => {
		console.log(error);
		setErrorMessage(error.message);
		if (error.message === 'HTTP Status 401') {
			setErrorMessage("Your token is invalid, please log out and enter a new token.")
		};
		if (error.message === 'HTTP Status 500') {
			setErrorMessage("500: Internal server error.")
		}
		setErrorAlert(true);
		});
	};

	const { register: registerPrivacy, handleSubmit: handleSubmitPrivacy } =
		useForm();

	// submit privacy stuffs
	const submitPrivacy = (data) => {
		fetch(`${API_URL}s`, {
			method: "PATCH",
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
				Authorization: localStorage.getItem("token"),
			},
		})
		.then((res) => {
			if (!res.ok)
				throw new Error('HTTP Status ' + res.status)
			return res.json();
		})
		.then(() => {
			setUser((prevState) => {
				return { ...prevState, ...data };
			});
			localStorage.setItem("user", JSON.stringify(user));
			setPrivacyEdit(false);
		})
		.catch((error) => {
			console.log(error);
			setErrorMessage(error.message);
			if (error.message === 'HTTP Status 401') {
					setErrorMessage("Your token is invalid, please log out and enter a new token.")
			};
			if (error.message === 'HTTP Status 500') {
				setErrorMessage("500: Internal server error.")
			}
			setErrorAlert(true);
		});
	};

	return (
		<>
		<BS.Card className="mb-3 mt-3 w-100">
			<BS.Card.Header className="d-flex align-items-center justify-content-between">
				<BS.Card.Title className="float-left">
					<FaAddressCard className="mr-4 float-left" /> {name} ({user.id})
				</BS.Card.Title>
				{user.avatar_url ? (
					<Popup
						trigger={
							<BS.Image
								src={`${user.avatar_url}`}
								style={{ width: 50, height: 50 }}
								tabIndex="0"
								className="float-right"
								roundedCircle
							/>
						}
						className="avatar"
						modal
					>
						{(close) => (
							<div className="text-center w-100 m-0" onClick={() => close()}>
								<div className="m-auto" style={{maxWidth: '640px'}}>
										<BS.Image src={`${avatar}`} style={{'maxWidth': '100%', height: 'auto'}} thumbnail />
								</div>
							</div>
						)}
					</Popup>
				) : (
					<BS.Image
						src={defaultAvatar}
						style={{ width: 50, height: 50 }}
						className="float-right"
						roundedCircle
					/>
				)}
			</BS.Card.Header>
			<BS.Card.Body>
				{errorAlert ? (
					<BS.Alert variant="danger">
						{errorMessage}
					</BS.Alert>
				) : (
					""
				)}
				{editMode ? (
					<BS.Form onSubmit={handleSubmitEdit(submitEdit)}>
					<BS.Form.Text className="mb-4">
					<b>Note:</b> if you refresh the page, the old data might show up again,
					this is due to the bot caching data.
					<br />
					Try editing a member to clear the cache, or wait a few minutes before
					refreshing.
					</BS.Form.Text>
					<BS.Form.Row>
					<BS.Col className="mb-lg-2" xs={12} lg={3}>
						<BS.Form.Label>Name:</BS.Form.Label>
						<BS.Form.Control
						name="name"
						{...registerEdit("name")}
						defaultValue={name}
						/>
					</BS.Col>
					<BS.Col className="mb-lg-2" xs={12} lg={3}>
						<BS.Form.Label>Tag:</BS.Form.Label>
						<BS.Form.Control
						name="tag"
						{...registerEdit("tag")}
						defaultValue={tag}
						/>
					</BS.Col>
					<BS.Col className="mb-lg-2" xs={12} lg={3}>
						<BS.Form.Label>Timezone:</BS.Form.Label>
						<BS.Form.Control
						name="tz"
						{...registerEdit("tz")}
						defaultValue={timezone}
						required
						/>
						{invalidTimezone ? (
						<BS.Form.Text>
							Please enter a valid
							<a
							href="https://xske.github.io/tz/"
							rel="noreferrer"
							target="_blank"
							>
							timezone
							</a>
						</BS.Form.Text>
						) : (
						""
						)}
					</BS.Col>
					<BS.Col className="mb-lg-2" xs={12} lg={3}>
						<BS.Form.Label>Avatar url:</BS.Form.Label>
						<BS.Form.Control
						type="url"
						name="avatar_url"
						{...registerEdit("avatar_url")}
						defaultValue={avatar}
						/>
					</BS.Col>
					<BS.Col className="mb-lg-2" xs={12} lg={3}>
						<BS.Form.Label>Banner url:</BS.Form.Label>
						<BS.Form.Control
						type="url"
						name="banner"
						{...registerEdit("banner")}
						defaultValue={banner}
						/>
					</BS.Col>
					</BS.Form.Row>
					<BS.Form.Group className="mt-3">
					<BS.Form.Label>Description:</BS.Form.Label>
					<BS.Form.Control
						maxLength="1000"
						as="textarea"
						name="description"
						{...registerEdit("description")}
						defaultValue={editDesc}
					/>
					</BS.Form.Group>
					<BS.Button variant="light" onClick={() => setEditMode(false)}>
					Cancel
					</BS.Button>{" "}
					<BS.Button variant="primary" type="submit">
					Submit
					</BS.Button>
				</BS.Form>
				) : (
					<>
						<BS.Row>
							<BS.Col className="mb-lg-3" xs={12} lg={3}>
								<b>ID:</b> {user.id}
							</BS.Col>
							<BS.Col className="mb-lg-3" xs={12} lg={3}>
								<b>Tag:</b> {tag}
							</BS.Col>
							<BS.Col className="mb-lg-3" xs={12} lg={3}>
								<b>Timezone:</b> {timezone}
							</BS.Col>
							{privacyView ? (
								""
							) : (
								<>
								<BS.Col className="mb-lg-3" xs={12} lg={3}>
									<b>Privacy:</b>{" "}
									<BS.Button
										variant="light"
										size="sm"
										onClick={() => setPrivacyView(true)}
									>
										View
									</BS.Button>
								</BS.Col>
								{user.banner ? 
									<BS.Col className="mb-lg-3" xs={12} lg={3}>
									<b>Banner:</b>{" "}
									<Popup
										trigger={
											<BS.Button
										variant="light"
										size="sm"
									>
										View
									</BS.Button>
										}
										className="banner"
										modal
									>
										{(close) => (
											<div className="text-center w-100" onClick={() => close()}>
												<div className="m-auto" style={{maxWidth: '100%'}}>
														<BS.Image src={`${banner}`} style={{maxWidth: 'auto', maxHeight: '640px'}} thumbnail />
												</div>
											</div>
										)}
									</Popup>
									</BS.Col>
								 : "" }
								 </> 
								 )}
						</BS.Row>
						{privacyEdit ? (
							<BS.Form onSubmit={handleSubmitPrivacy(submitPrivacy)}>
							<hr />
							<h5>Editing privacy settings</h5>
							<BS.Form.Row className="mb-3 mb-lg-0">
								<BS.Col className="mb-lg-2" xs={12} lg={3}>
									<BS.Form.Label>Description:</BS.Form.Label>
									<BS.Form.Control
										name="description_privacy"
										defaultValue={user.description_privacy}
										as="select"
										{...registerPrivacy("description_privacy")}
									>
										<option>public</option>
										<option>private</option>
									</BS.Form.Control>
								</BS.Col>
								<BS.Col className="mb-lg-2" xs={12} lg={3}>
									<BS.Form.Label>Member list:</BS.Form.Label>
									<BS.Form.Control
										name="member_list_privacy"
										defaultValue={user.member_list_privacy}
										as="select"
										{...registerPrivacy("member_list_privacy")}
									>
										<option>public</option>
										<option>private</option>
									</BS.Form.Control>
								</BS.Col>
								<BS.Col className="mb-lg-2" xs={12} lg={3}>
									<BS.Form.Label>Front:</BS.Form.Label>
									<BS.Form.Control
										name="front_privacy"
										as="select"
										defaultValue={user.front_privacy}
										{...registerPrivacy("front_privacy")}
									>
										<option>public</option>
										<option>private</option>
									</BS.Form.Control>
								</BS.Col>
								<BS.Col className="mb-lg-2" xs={12} lg={3}>
									<BS.Form.Label>Front history:</BS.Form.Label>
									<BS.Form.Control
										name="front_history_privacy"
										defaultValue={user.front_history_privacy}
										as="select"
										{...registerPrivacy("front_history_privacy")}
									>
										<option>public</option>
										<option>private</option>
									</BS.Form.Control>
								</BS.Col>
							</BS.Form.Row>
							<BS.Button variant="light" onClick={() => setPrivacyEdit(false)}>
								Cancel
							</BS.Button>{" "}
							<BS.Button variant="primary" type="submit">
								Submit
							</BS.Button>
							<hr />
						</BS.Form>
						) : privacyView ? (
							<>
								<hr />
								<h5>Viewing privacy settings</h5>
								<BS.Row>
									<BS.Col className="mb-lg-3" xs={12} lg={3}>
										<b>Description:</b> {user.description_privacy}
									</BS.Col>
									<BS.Col className="mb-lg-3" xs={12} lg={3}>
										<b>Member list: </b>
										{user.member_list_privacy}
									</BS.Col>
									<BS.Col className="mb-lg-3" xs={12} lg={3}>
										<b>Front:</b> {user.front_privacy}
									</BS.Col>
									<BS.Col className="mb-lg-3" xs={12} lg={3}>
										<b>Front history:</b> {user.front_history_privacy}
									</BS.Col>
								</BS.Row>
								<BS.Button
									variant="light"
									onClick={() => setPrivacyView(false)}
								>
									Exit
								</BS.Button>{" "}
								<BS.Button
									variant="primary"
									onClick={() => setPrivacyEdit(true)}
								>
									Edit
								</BS.Button>
								<hr />
							</>
						) : (
							""
						)}
						<p>
							<b>Description:</b>
						</p>
						{ localStorage.getItem("twemoji") ? <p dangerouslySetInnerHTML={{__html: twemoji.parse(desc)}}></p> : <p dangerouslySetInnerHTML={{__html: desc}}></p>}
						{ !user.banner || !localStorage.getItem("bottombanners") ? "" : 
							<BS.Image rounded className="mb-2" style={{width: '100%', maxHeight: '15rem', objectFit: 'cover'}} src={banner}/>
						}
						{privacyEdit ? (
							""
						) : privacyView ? (
							""
						) : (
							<>
								<BS.Button variant="light" onClick={() => setEditMode(true)}>
									Edit
								</BS.Button>
								<BS.Button
									variant="primary"
									className="float-right"
									onClick={() => history.push(`/profile/${user.id}`)}
								>
									Profile
								</BS.Button>
							</>
						)}
					</>
				)}
			</BS.Card.Body>
		</BS.Card>
		</>
	);
}

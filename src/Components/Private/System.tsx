import React, { useState, useEffect } from "react";
import * as BS from "react-bootstrap";
import autosize from "autosize";
import "moment-timezone";
import Popup from "reactjs-popup";
import twemoji from 'twemoji';

import history from "../../History.js";
import defaultAvatar from "../../default_discord_avatar.png";
import { FaAddressCard, FaUserLock } from "react-icons/fa";
import { useForm } from 'react-hook-form';
import moment from 'moment';
import Sys from "../../API/system";
import PKAPI from "../../API/index";
import { toHTML } from "../../Functions/discord-parser.js";
import { BETA_URL } from "../../Constants/constants.js";


export default function System() {

	// set a blank slate for the user
	const [user, setUser] = useState({
		id: "",
		name: null,
		banner: null,
		description: toHTML("(no description)", {}, null, null), // this has to be set to html because of the twemoji parsing while rendering
		tag: null,
		avatar_url: null,
		timezone: "UTC",
		color: null,
		created: null,
		privacy: {
			description_privacy: "public",
			member_list_privacy: "public",
			group_list_privacy: "public",
			front_privacy: "public",
			front_history_privacy: "public"
		}
	  });

	// more useState, this time to actually handle state
	// TODO: name them something more intuitive maybe?
	const [editMode, setEditMode] = useState(false);
	const [privacyEdit, setPrivacyEdit] = useState(false);

	const [errorAlert, setErrorAlert] = useState(false);
	const [ errorMessage, setErrorMessage ] = useState("");

	const api = new PKAPI(localStorage.getItem("betabot") ? BETA_URL : "");

	// replace the blank user slate with the user from localstorage
	useEffect(() => {
		const { toHTML } = require("../../Functions/discord-parser.js");
		var local= new Sys(JSON.parse(localStorage.getItem("user")));
		console.log(local);

		setUser({...user,
			...(local.id && {id: local.id}),
			...(local.name && {name: local.name}),
			...(local.banner && {banner: local.banner}),
			...(local.description && {description: toHTML(local.description, {}, null, null)}),
			...(local.tag && {tag: local.tag}),
			...(local.avatar_url && {avatar_url: local.avatar_url}),
			...(local.timezone && {timezone: local.timezone}),
			...(local.color && {color: local.color}),
			...(local.created && {created: moment(local.created).format('MMM D, YYYY')})
			});
	}, []);

	// this just resizes the textarea when filled with larger amounts of text
	useEffect(() => {
		autosize(document.querySelector("textarea"));
	});

	const [invalidTimezone, setInvalidTimezone] = useState(false);

	const { register: registerEdit, handleSubmit: handleSubmitEdit } = useForm();
	const { register: registerPrivacy, handleSubmit: handleSubmitPrivacy, setValue: setPrivacyValue } = useForm();

	function handleError(error: Error) {
		console.log(error);
		setErrorMessage(error.message);
		setErrorAlert(true);
	}

	async function submitEdit(data) {
		console.log(data);
		if (data.timezone) {
			if (!moment.tz.zone(data.timezone)) {
			setInvalidTimezone(true);
			return;
			}
		}
		try {
			await api.patchSystem({token: localStorage.getItem('token'), data: data});
			setUser((prevState) => {
				return { ...prevState, ...data };
			});
			localStorage.setItem("user", JSON.stringify(user));
			if (editMode) setEditMode(false);
			if (privacyEdit) setPrivacyEdit(false);
			setErrorAlert(false);
		} catch (error) {
			handleError(error);
		}
	}

	function setAllPrivacyFields(e) {
		setPrivacyValue("privacy.description_privacy", e.target.value);
		setPrivacyValue("privacy.member_list_privacy", e.target.value);
		setPrivacyValue("privacy.group_list_privacy", e.target.value);
		setPrivacyValue("privacy.front_privacy", e.target.value);
		setPrivacyValue("privacy.front_history_privacy", e.target.value);
	}

	return (
		<>
		<BS.Card className="mb-3 mt-3 w-100">
			<BS.Card.Header className="d-flex align-items-center justify-content-between">
				<BS.Card.Title className="float-left">
					<FaAddressCard className="mr-4 float-left" /> {user.name} ({user.id})
				</BS.Card.Title>
				{user.avatar_url ? (
					<Popup
						trigger={
							<BS.Image
								src={`${user.avatar_url}`}
								style={{ width: 50, height: 50 }}
								tabIndex={0}
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
										<BS.Image src={`${user.avatar_url}`} style={{'maxWidth': '100%', height: 'auto'}} thumbnail />
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
			<BS.Card.Body style={{borderLeft: `5px solid #${user.color}` }}>
				{errorAlert ? (
					<BS.Alert variant="danger">
						{errorMessage}
					</BS.Alert>
				) : (
					""
				)}
				{editMode ? (
					<BS.Form onSubmit={handleSubmitEdit(async (data) => submitEdit(data))}>
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
						maxLength={100}
						{...registerEdit("name")}
						defaultValue={user.name}
						/>
					</BS.Col>
					<BS.Col className="mb-lg-2" xs={12} lg={3}>
						<BS.Form.Label>Tag:</BS.Form.Label>
						<BS.Form.Control
						name="tag"
						{...registerEdit("tag")}
						defaultValue={user.tag}
						/>
					</BS.Col>
					<BS.Col className="mb-lg-2" xs={12} lg={3}>
						<BS.Form.Label>Timezone:</BS.Form.Label>
						<BS.Form.Control
						name="tz"
						{...registerEdit("tz")}
						defaultValue={user.timezone}
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
						maxLength={256}
						type="url"
						name="avatar_url"
						{...registerEdit("avatar_url")}
						defaultValue={user.avatar_url}
						/>
					</BS.Col>
					<BS.Col className="mb-lg-2" xs={12} lg={3}>
						<BS.Form.Label>Banner url:</BS.Form.Label>
						<BS.Form.Control
						maxLength={256}
						type="url"
						name="banner"
						{...registerEdit("banner")}
						defaultValue={user.banner}
						/>
					</BS.Col>
					<BS.Col className="mb-lg-2" xs={12} lg={3}>
						<BS.Form.Label>Color:</BS.Form.Label> 
						<BS.Form.Control pattern="[A-Fa-f0-9]{6}" name="color" {...registerEdit("color")} defaultValue={user.color} />
						<BS.Form.Text>(hexcode)</BS.Form.Text>
					</BS.Col>
					</BS.Form.Row>
					<BS.Form.Group className="mt-3">
					<BS.Form.Label>Description:</BS.Form.Label>
					<BS.Form.Control
						maxLength={1000}
						as="textarea"
						name="description"
						{...registerEdit("description")}
						defaultValue={user.description}
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
								<b>Tag:</b> {user.tag}
							</BS.Col>
							<BS.Col className="mb-lg-3" xs={12} lg={3}>
								<b>Timezone:</b> {user.timezone}
							</BS.Col>
							<BS.Col className="mb-lg-3" xs={12} lg={3}>
								<b>Created:</b> {user.created}
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
													<BS.Image src={`${user.banner}`} style={{maxWidth: 'auto', maxHeight: '640px'}} thumbnail />
											</div>
										</div>
									)}
								</Popup>
								</BS.Col>
								: "" }
							{ user.color ? <BS.Col className="mb-lg-3" xs={12} lg={3}><b>Color:</b> {user.color}</BS.Col> : ""}
						</BS.Row>
						<p>
							<b>Description:</b>
						</p>
						{ localStorage.getItem("twemoji") ? <p dangerouslySetInnerHTML={{__html: twemoji.parse(user.description)}}></p> : <p dangerouslySetInnerHTML={{__html: user.description}}></p>}
						{ !user.banner || !localStorage.getItem("bottombanners") ? "" : 
							<BS.Image rounded className="mb-2" style={{width: '100%', maxHeight: '15rem', objectFit: 'cover'}} src={user.banner}/>
						}
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
					</>
				)}
			</BS.Card.Body>
		</BS.Card>
		<BS.Card>
			<BS.Card.Header className="d-flex align-items-center justify-content-between">
				<BS.Card.Title className="float-left">
					<FaUserLock className="mr-4 float-left" /> Privacy settings {privacyEdit ? "(editing)" : ""}
				</BS.Card.Title>
			</BS.Card.Header>
			<BS.Card.Body style={{borderLeft: `5px solid #${user.color}` }}>
				{ !privacyEdit ? <>
				<BS.Row>
					<BS.Col className="mb-lg-3" xs={12} lg={3}>
						<b>Description:</b> {user.privacy.description_privacy}
					</BS.Col>
					<BS.Col className="mb-lg-3" xs={12} lg={3}>
						<b>Member list: </b>
						{user.privacy.member_list_privacy}
					</BS.Col>
					<BS.Col className="mb-lg-3" xs={12} lg={3}>
						<b>Group list:</b> {user.privacy.group_list_privacy}
					</BS.Col>
					<BS.Col className="mb-lg-3" xs={12} lg={3}>
						<b>Front:</b> {user.privacy.front_privacy}
					</BS.Col>
					<BS.Col className="mb-lg-3" xs={12} lg={3}>
						<b>Front history:</b> {user.privacy.front_history_privacy}
					</BS.Col>
				</BS.Row>
				<BS.Button
					variant="primary"
					onClick={() => setPrivacyEdit(true)}
				>
					Edit
				</BS.Button>
				</> :
				<BS.Form onSubmit={handleSubmitPrivacy(async (data) => submitEdit(data))}>
					<BS.Row>
						<BS.Col className="mb-lg-2" xs={12} lg={6}>
							<BS.Form.Label>Set all fields to:</BS.Form.Label>
							<BS.Form.Control name="set_all" as="select" onChange={(e) => {setAllPrivacyFields(e)}}>
								<option>public</option>
								<option>private</option>
							</BS.Form.Control>
						</BS.Col>
					</BS.Row>
					<hr/>
					<BS.Form.Row className="mb-3 mb-lg-0">
						<BS.Col className="mb-lg-2" xs={12} lg={3}>
							<BS.Form.Label>Description:</BS.Form.Label>
							<BS.Form.Control
								name="description_privacy"
								defaultValue={user.privacy.description_privacy}
								as="select"
								{...registerPrivacy("privacy.description_privacy")}
							>
								<option>public</option>
								<option>private</option>
							</BS.Form.Control>
						</BS.Col>
						<BS.Col className="mb-lg-2" xs={12} lg={3}>
							<BS.Form.Label>Member list:</BS.Form.Label>
							<BS.Form.Control
								name="member_list_privacy"
								defaultValue={user.privacy.member_list_privacy}
								as="select"
								{...registerPrivacy("privacy.member_list_privacy")}
							>
								<option>public</option>
								<option>private</option>
							</BS.Form.Control>
						</BS.Col>
						<BS.Col className="mb-lg-2" xs={12} lg={3}>
							<BS.Form.Label>Group list:</BS.Form.Label>
							<BS.Form.Control
								name="group_list_privacy"
								defaultValue={user.privacy.group_list_privacy}
								as="select"
								{...registerPrivacy("privacy.group_list_privacy")}
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
								defaultValue={user.privacy.front_privacy}
								{...registerPrivacy("privacy.front_privacy")}
							>
								<option>public</option>
								<option>private</option>
							</BS.Form.Control>
						</BS.Col>
						<BS.Col className="mb-lg-2" xs={12} lg={3}>
							<BS.Form.Label>Front history:</BS.Form.Label>
							<BS.Form.Control
								name="front_history_privacy"
								defaultValue={user.privacy.front_history_privacy}
								as="select"
								{...registerPrivacy("privacy.front_history_privacy")}
							>
								<option>public</option>
								<option>private</option>
							</BS.Form.Control>
						</BS.Col>
					</BS.Form.Row>
					<hr/>
					<BS.Button variant="light" onClick={() => setPrivacyEdit(false)}>
						Cancel
					</BS.Button>{" "}
					<BS.Button variant="primary" type="submit">
						Submit
					</BS.Button>
				</BS.Form>}
			</BS.Card.Body>
		</BS.Card>
		</>
	);
}

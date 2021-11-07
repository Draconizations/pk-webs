import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import  * as BS from 'react-bootstrap';

import Loading from '../Components/Loading';
import API_URL from '../Constants/constants';
import PKAPI from "../API/index"
import ProfilePage from '../Components/Public/ProfilePage';

const MemberProfile = () => {
	type memberParams = {
		memberID: string
	}
	const { memberID } = useParams<memberParams>();

	const [isLoading, setIsLoading ] = useState(true);
	const [isError, setIsError ] = useState(false);
	const [ errorMessage, setErrorMessage] = useState("");
	const [ member, setMember ] = useState({});

	useEffect(() => {
		fetchMember();
	}, []);

	var api = new PKAPI();

	async function fetchMember() {
		try {
			let res = await api.getMember({id: memberID});
			setMember(res);
			setIsLoading(false);
		} catch (error) {
			console.log(error);
			setErrorMessage(error.message);
			setIsError(true);
			setIsLoading(false);
		}
	}

	return (
			isLoading ? <Loading /> : isError ? 
			<BS.Alert variant="danger">{errorMessage}</BS.Alert> : <ProfilePage member={member}/>
	);
}

export default MemberProfile;
import React, { useState, useEffect } from 'react';
import Memberlist from '../Components/Private/Memberlist';
import System from '../Components/Private/System';
import history from '../History.js'
import * as BS from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import GroupList from '../Components/Private/GroupList';
import PKAPI from '../API';
import Group from '../API/group';

export default function Dash({}) {
    type dashLocation = {
        tab: string
      }

    const location = useLocation<dashLocation>(); 
    const [tabView, setTabView] = useState(location.state ? location.state.tab : "system");
    const [user,] = useState(JSON.parse(localStorage.getItem("user")));
    
    const [groups, setGroups ] = useState([]);
    const [ groupsLoading, setGroupsLoading ] = useState(true);
    const [ groupsError, setGroupsError ] = useState(false);
    const [ groupsErrorMessage, setGroupsErrorMessage] = useState("");
    
    const api = new PKAPI(localStorage.getItem("betabot") ? BETA_URL : "");
    
    useEffect(() => {

        fetchGroups();
    }, []);

    async function fetchGroups() {
        try {
            var res: Group[] = await api.getGroupList({token: localStorage.getItem('token')});
            setGroups(res);
            setGroupsLoading(false);
        } catch (error) {
            console.log(error);
            setGroupsErrorMessage(error.message);
            setGroupsError(true);
            setGroupsLoading(false);
        }
    }

    if (!localStorage.getItem('token')) { 
        history.push("/");
        return (<></>); // this is needed because the rendering crashes otherwise
    }
    else return (<>
            { user.banner && !localStorage.getItem("hidebanners") ? <div className="banner" style={{backgroundImage: `url(${user.banner})`}}/> : ""}
            
            { localStorage.getItem("betabot") ? <BS.Alert variant="info">You are currently using the beta bot.</BS.Alert> : ""}
            <BS.Tabs id="dash-tabs" activeKey={tabView} onSelect={(k) => setTabView(k)} className="flex-column flex-md-row" >
                <BS.Tab className="pt-2" eventKey="system" title="System">
                    <System />
                </BS.Tab>
                <BS.Tab className="pt-4" eventKey="members" title="Members">
                    <Memberlist/>
                </BS.Tab>
                <BS.Tab className="pt-4" eventKey="groups" title="Groups">
                    <GroupList groups={groups} groupsLoading={groupsLoading} groupsErrorMessage={groupsErrorMessage} groupsError={groupsError} setGroups={setGroups} fetchGroups={ fetchGroups}/>
                </BS.Tab>
            </BS.Tabs>
            </>
    );
}
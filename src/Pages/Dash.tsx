import React, { useState } from 'react';
import Memberlist from '../Components/Private/Memberlist';
import System from '../Components/Private/System';
import history from '../History.js'
import * as BS from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import GroupList from '../Components/Private/GroupList';

export default function Dash({}) {
    type dashLocation = {
        tab: string
      }

    const location = useLocation<dashLocation>(); 
    const [tabView, setTabView] = useState(location.state ? location.state.tab : "system");
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

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
                    <GroupList />
                </BS.Tab>
            </BS.Tabs>
            </>
    );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as BS from 'react-bootstrap';
import { FaLink, FaLock } from 'react-icons/fa';
import Popup from 'reactjs-popup';
import defaultAvatar from '../../default_discord_avatar.png';
import { toHTML } from "../../Functions/discord-parser.js";

export default function GroupCard({g, edit}) {
    const [ group, setGroup ] = useState({
        id: "",
        uuid: "",
        name: null,
        display_name: null,
        description: "(no description)",
        icon: null,
        banner: null,
        color: null,
        privacy: {
            description_privacy: "public",
            icon_privacy: "public",
            list_privacy: "public",
            visibility: "public"
        }
    });

    useEffect(() => {
        setGroup({...group,
            ...(g.id && {id: g.id}),
            ...(g.uuid && {uuid: g.uuid}),
            ...(g.name && {name: g.name}),
            ...(g.display_name && {display_name: g.display_name}),
            ...(g.description && {description: g.description}),
            ...(g.icon && {icon: g.icon}),
            ...(g.banner && {banner: g.banner}),
            ...(g.color && {color: g.color}),
            privacy: {
                ...g.privacy.description_privacy && {description_privacy: g.privacy.description_privacy},
                ...g.privacy.icon_privacy && {icon_privacy: g.privacy.icon_privacy},
                ...g.privacy.list_privacy && {list_privacy: g.privacy.list_privacy},
                ...g.privacy.visibility && {visibility: g.privacy.visibility}
            }
        });
    });

    

    function copyLink() {
        var link = `https://pk-webs.spectralitree.com/profile/g/${group.id}`
        var textField = document.createElement('textarea')
        textField.innerText = link
        document.body.appendChild(textField);

        textField.select();
        textField.setSelectionRange(0, 99999);
        document.execCommand('copy');

        document.body.removeChild(textField);
}

    function renderHeader() {
        return (
            <BS.Card.Header className="d-flex align-items-center justify-content-between">
                <div>
                    { group.privacy.visibility === "public" ? 
                        <BS.OverlayTrigger placement="left" overlay={
                            <BS.Tooltip id="copy link">Copy public link</BS.Tooltip>}>
                            <BS.Button variant="link" onClick={() => copyLink()}><FaLink style={{fontSize: '1.25rem'}}/></BS.Button>
                        </BS.OverlayTrigger> : 
                        <BS.Button variant="link"><FaLock style={{fontSize: '1.25rem'}} /></BS.Button>}
                    {localStorage.getItem('pagesonly') ? 
                    <Link to={`dash/g/${group.id}`}>
                        <BS.Button variant="link">
                            <b>{group.name}</b> ({group.id})
                        </BS.Button>
                    </Link> :
                    <BS.Accordion.Toggle as={BS.Button} variant="link" eventKey={group.id}>
                        <b>{group.name}</b> ({group.id})
                    </BS.Accordion.Toggle>}
                </div>
                {group.icon ? 
                <Popup trigger={
                    <BS.Image src={group.icon} style={{width: 50, height: 50}} tabIndex={0} className="float-right" roundedCircle/>
                } className="avatar" modal>
                    {close => (
                            <div className="text-center w-100 m-0" onClick={() => close()}>
                                <div className="m-auto" style={{maxWidth: '640px'}}>
                                    <BS.Image src={group.icon} style={{'maxWidth': '100%', height: 'auto'}} thumbnail />
                                </div>
                            </div>
                        )}
                </Popup> : 
                <BS.Image src={defaultAvatar} style={{width: 50, height: 50}} tabIndex={0} className="float-right" roundedCircle />}
            </BS.Card.Header>
        );
    }

    return (
        renderHeader()
    )
}
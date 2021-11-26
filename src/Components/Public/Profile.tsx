import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as BS from 'react-bootstrap';
import Popup from 'reactjs-popup';
import twemoji from 'twemoji';
import { FaAddressCard } from "react-icons/fa";
import defaultAvatar from '../../default_discord_avatar.png'
import Loading from "../Loading.js";
import { API_V2_URL } from "../../Constants/constants.js";
import ProfileList from "./ProfileList";
import PKAPI from "../../API/index"
import Sys from '../../API/system';
import { toHTML } from '../../Functions/discord-parser.js';

export default function Profile () {

  // grab the system id from the url
  type sysParams = {
    sysID: string
  }
  const { sysID } = useParams<sysParams>();

  // set a blank slate for the system
  const [system, setSystem] = useState({
    id: "",
    name: null,
    banner: null,
    description: toHTML("(no description)", {}, null, null), // this has to be set to html because of the twemoji parsing while rendering
    tag: null,
    avatar_url: null,
    timezone: "UTC",
    color: null,
    created: null
  });

  // initialize the API
  var api = new PKAPI(API_V2_URL);

  // some state handling stuff
  const [ isLoading, setIsLoading ] = useState(true);
  const [ isError, setIsError ] = useState(false);
  const [ errorMessage, setErrorMessage] = useState("");
  
  useEffect(() => {
    fetchSystem();
  }, [])

  async function fetchSystem() {
    try {
      var res: Sys = await api.getSystem({id: sysID});
      // overwrite each value if a value is set
      setSystem({...system,
        ...(res.id && {id: res.id}),
        ...(res.name && {name: res.name}),
        ...(res.banner && {banner: res.banner}),
        ...(res.description && {description: toHTML(res.description, {}, null, null)}),
        ...(res.tag && {tag: res.tag}),
        ...(res.avatar_url && {avatar_url: res.avatar_url}),
        ...(res.timezone && {timezone: res.timezone}),
        ...(res.color && {color: res.color}),
        ...(res.created && {created: res.created})
      });
      // aaand we're done loading!
      setIsLoading(false);
    }
    catch (error) {
      console.log(error);
      setErrorMessage(error.message); // hopefully this way of handling errors should work out?
      setIsError(true);
      setIsLoading(false);
    }
  }

  if (isLoading) return (
    <Loading/>
  )
  else if (isError) return (
    <BS.Alert variant="danger">{errorMessage}</BS.Alert>
  )

  // TODO: clean this absolute MESS up
  else return (
    <>{ system.banner && !localStorage.getItem("hidebanners") ? <div className="banner" style={{backgroundImage: `url(${system.banner})`}}/> : ""}
    <BS.Alert variant="primary" >You are currently <b>viewing</b> a system.</BS.Alert>
        <BS.Card className="mb-3 mt-3 w-100" >
        <BS.Card.Header className="d-flex align-items-center justify-content-between">
           <BS.Card.Title className="float-left"><FaAddressCard className="mr-4 float-left" /> {system.name ? system.name : ""} ({system.id})</BS.Card.Title> 
           { system.avatar_url ? <Popup trigger={<BS.Image src={`${system.avatar_url}`} style={{width: 50, height: 50}} tabIndex={0} className="float-right" roundedCircle />} className="avatar" modal>
         {close => (
             <div className="text-center w-100 m-0" onClick={() => close()}>
                <div className="m-auto" style={{maxWidth: '640px'}}>
                    <BS.Image src={`${system.avatar_url}`} style={{'maxWidth': '100%', height: 'auto'}} thumbnail />
                </div>
             </div>
         )}
     </Popup> : 
        <BS.Image src={defaultAvatar} style={{width: 50, height: 50}} className="float-right" roundedCircle />}
        </BS.Card.Header>
        <BS.Card.Body style={{borderLeft: `5px solid #${system.color}` }}>
        <BS.Row>
             <BS.Col className="mb-lg-3" xs={12} lg={3}><b>ID:</b> {system.id}</BS.Col>
             { system.tag ? <BS.Col className="mb-lg-3" xs={12} lg={3}><b>Tag:</b> {system.tag}</BS.Col> : "" }
             <BS.Col className="mb-lg-3" xs={12} lg={3}><b>Timezone:</b> {system.timezone}</BS.Col>
             { system.color ? <BS.Col className="mb-lg-3" xs={12} lg={3}><b>Color:</b> {system.color}</BS.Col> : ""}
             {system.banner ? 
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
                            <BS.Image src={`${system.banner}`} style={{maxWidth: 'auto', maxHeight: '640px'}} thumbnail />
                        </div>
                      </div>
                    )}
                  </Popup>
                  </BS.Col>
                 : "" }
         </BS.Row>
         <p><b>Description:</b></p>
         {localStorage.getItem("twemoji") ? <p dangerouslySetInnerHTML={{__html: twemoji.parse(system.description)}}></p> : <p dangerouslySetInnerHTML={{__html: system.description}}></p>}
         { !system.banner || !localStorage.getItem("bottombanners") ? "" : 
              <BS.Image rounded className="mb-2" style={{width: '100%', maxHeight: '15rem', objectFit: 'cover'}} src={system.banner}/>
            }
         </BS.Card.Body>
    </BS.Card>
    
    <ProfileList/> </>
   )
}
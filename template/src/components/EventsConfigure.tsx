/*
********************************************
 Copyright © 2022 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useContext, useEffect} from 'react';
import {RtcContext} from '../../agora-rn-uikit';
import events from '../rtm-events-api';
import {controlMessageEnum} from '../components/ChatContext';

interface Props {
  children: React.ReactNode;
}

const EventsConfigure: React.FC<Props> = (props) => {
  const {RtcEngine, dispatch} = useContext(RtcContext);
  useEffect(() => {
    events.on(controlMessageEnum.muteVideo, () => {
      RtcEngine.muteLocalVideoStream(true);
      dispatch({
        type: 'LocalMuteVideo',
        value: [0],
      });
    });
    events.on(controlMessageEnum.muteAudio, () => {
      RtcEngine.muteLocalAudioStream(true);
      dispatch({
        type: 'LocalMuteAudio',
        value: [0],
      });
    });
    events.on(controlMessageEnum.kickUser, () => {
      dispatch({
        type: 'EndCall',
        value: [],
      });
    });
    return () => {
      events.off(controlMessageEnum.muteVideo);
      events.off(controlMessageEnum.muteAudio);
      events.off(controlMessageEnum.kickUser);
    };
  }, []);

  return <>{props.children}</>;
};

export default EventsConfigure;

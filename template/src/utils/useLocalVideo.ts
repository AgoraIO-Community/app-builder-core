/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/

import {DispatchContext, RtcContext} from '../../agora-rn-uikit';
import {useContext} from 'react';
import {isWeb} from './common';

function useLocalVideo() {
  const {dispatch} = useContext(DispatchContext);
  const {RtcEngineUnsafe} = useContext(RtcContext);

  const disableVideoButton = () => {
    RtcEngineUnsafe.muteLocalVideoStream(true);
    dispatch({
      type: 'LocalMuteVideo',
      value: [0, true],
    });
  };

  const enableVideoButton = () => {
    dispatch({
      type: 'LocalMuteVideo',
      value: [0, false],
    });
  };

  const getLocalVideoStream = () => {
    try {
      return isWeb() ? window?.engine?.localStream?.video : null;
    } catch (error) {
      throw error;
    }
  };

  const getRemoteVideoStream = (uid: number) => {
    try {
      return isWeb() ? window?.engine?.remoteStreams?.get(uid)?.video : null;
    } catch (error) {
      throw error;
    }
  };

  const getLocalScreenshareVideoStream = () => {
    try {
      return isWeb() ? window?.engine?.screenStream?.video : null;
    } catch (error) {
      throw error;
    }
  };

  return {
    enableVideoButton,
    disableVideoButton,
    getLocalVideoStream,
    getRemoteVideoStream,
    getLocalScreenshareVideoStream,
  };
}

export default useLocalVideo;

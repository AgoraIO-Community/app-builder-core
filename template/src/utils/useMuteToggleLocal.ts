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
import {useLocalUserInfo, useRtc} from 'customization-api';
import {ToggleState} from '../../agora-rn-uikit/src/Contexts/PropsContext';

export enum MUTE_LOCAL_TYPE {
  audio,
  video,
}
/**
 * Returns an asynchronous function to toggle muted state of the given track type for the local user.
 */
function useMuteToggleLocal() {
  const {RtcEngine, dispatch} = useRtc();
  const local = useLocalUserInfo();

  return async (type: MUTE_LOCAL_TYPE) => {
    switch (type) {
      case MUTE_LOCAL_TYPE.audio:
        let localAudioState = local.audio;
        // Don't do anything if it is in a transitional state
        if (
          localAudioState === ToggleState.enabled ||
          localAudioState === ToggleState.disabled
        ) {
          // Disable UI
          dispatch({
            type: 'LocalMuteAudio',
            value: [
              localAudioState === ToggleState.enabled
                ? ToggleState.disabling
                : ToggleState.enabling,
            ],
          });

          try {
            await RtcEngine.muteLocalAudioStream(
              localAudioState === ToggleState.enabled,
            );
            // Enable UI
            dispatch({
              type: 'LocalMuteAudio',
              value: [
                localAudioState === ToggleState.enabled
                  ? ToggleState.disabled
                  : ToggleState.enabled,
              ],
            });
          } catch (e) {
            console.error(e);
            dispatch({
              type: 'LocalMuteAudio',
              value: [localAudioState],
            });
          }
        }
        break;
      case MUTE_LOCAL_TYPE.video:
        const localVideoState = local.video;
        // Don't do anything if it is in a transitional state
        if (
          localVideoState === ToggleState.enabled ||
          localVideoState === ToggleState.disabled
        ) {
          // Disable UI
          dispatch({
            type: 'LocalMuteVideo',
            value: [
              localVideoState === ToggleState.enabled
                ? ToggleState.disabling
                : ToggleState.enabling,
            ],
          });

          try {
            await RtcEngine.muteLocalVideoStream(
              localVideoState === ToggleState.enabled ? true : false,
            );

            // Enable UI
            dispatch({
              type: 'LocalMuteVideo',
              value: [
                localVideoState === ToggleState.enabled
                  ? ToggleState.disabled
                  : ToggleState.enabled,
              ],
            });
          } catch (e) {
            console.log('error while dispatching');
            dispatch({
              type: 'LocalMuteVideo',
              value: [localVideoState],
            });
          }
        }
        break;
    }
  };
}

export default useMuteToggleLocal;

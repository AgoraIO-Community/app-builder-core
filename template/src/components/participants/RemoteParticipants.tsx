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
import React from 'react';
import {View, Text} from 'react-native';
import RemoteAudioMute from '../../subComponents/RemoteAudioMute';
import RemoteVideoMute from '../../subComponents/RemoteVideoMute';
import {ApprovedLiveStreamControlsView} from '../../subComponents/livestream';
import RemoteEndCall from '../../subComponents/RemoteEndCall';
import ParticipantName from './ParticipantName';
import {UidType} from '../../../agora-rn-uikit';

interface remoteParticipantsInterface {
  p_styles: any;
  name: string;
  user: any;
  showControls: boolean;
  isHost: boolean;
  uid: UidType;
}

const RemoteParticipants = (props: remoteParticipantsInterface) => {
  const {p_styles, user, name, showControls, isHost, uid} = props;
  //todo hari remove as number and update typing
  return (
    <View style={p_styles.participantRow}>
      <ParticipantName value={name} />
      {showControls ? (
        <View style={p_styles.participantActionContainer}>
          {$config.EVENT_MODE && (
            <ApprovedLiveStreamControlsView
              p_styles={p_styles}
              uid={uid as number}
            />
          )}
          <View style={[p_styles.actionBtnIcon, {marginRight: 10}]}>
            <RemoteEndCall uid={uid as number} isHost={isHost} />
          </View>
          <View style={[p_styles.actionBtnIcon, {marginRight: 10}]}>
            <RemoteAudioMute
              uid={uid as number}
              audio={user.audio}
              isHost={isHost}
            />
          </View>
          <View style={[p_styles.actionBtnIcon]}>
            <RemoteVideoMute
              uid={uid as number}
              video={user.video}
              isHost={isHost}
            />
          </View>
        </View>
      ) : (
        <></>
        // <View style={p_styles.dummyView}>
        //   <Text>Remote screen sharing</Text>
        // </View>
      )}
    </View>
  );
};
export default RemoteParticipants;

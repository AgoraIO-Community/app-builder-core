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
import {View} from 'react-native';
import RemoteAudioMute from '../../subComponents/RemoteAudioMute';
import RemoteVideoMute from '../../subComponents/RemoteVideoMute';
import {participantStylesInterface} from '../ParticipantsView';
import {ApprovedLiveStreamControlsView} from '../../subComponents/livestream';
import RemoteEndCall from '../../subComponents/RemoteEndCall';
import ParticipantName from './ParticipantName';

interface IProps {
  participantStyles: participantStylesInterface;
  name: string;
  user: any;
  showControls: boolean;
  isHost: boolean;
}

const RemoteParticipants = (props: IProps) => {
  const {participantStyles, user, name, showControls, isHost} = props;

  return (
    <View style={participantStyles.participantRow}>
      <ParticipantName value={name} />
      {showControls ? (
        <View style={participantStyles.participantActionContainer}>
          {$config.EVENT_MODE && (
            <ApprovedLiveStreamControlsView
              participantStyles={participantStyles}
              uid={user.uid}
            />
          )}
          <View style={[participantStyles.actionBtnIcon, {marginRight: 10}]}>
            <RemoteEndCall uid={user.uid} isHost={isHost} />
          </View>
          <View style={[participantStyles.actionBtnIcon, {marginRight: 10}]}>
            <RemoteAudioMute
              uid={user.uid}
              audio={user.audio}
              isHost={isHost}
            />
          </View>
          <View style={[participantStyles.actionBtnIcon]}>
            <RemoteVideoMute
              uid={user.uid}
              video={user.video}
              isHost={isHost}
            />
          </View>
        </View>
      ) : (
        <></>
        // <View style={participantStyles.dummyView}>
        //   <Text>Remote screen sharing</Text>
        // </View>
      )}
    </View>
  );
};
export default RemoteParticipants;

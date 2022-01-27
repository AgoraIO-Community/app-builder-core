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
import {LocalAudioMute, LocalVideoMute} from '../../../agora-rn-uikit';
import {LocalUserContext} from '../../../agora-rn-uikit';
import ParticipantName from './ParticipantName';

const MeParticipant = (props: any) => {
  const {p_style, name} = props;

  return (
    <View style={p_style.participantRow}>
      <ParticipantName value={name} />
      <View style={p_style.participantActionContainer}>
        <LocalUserContext>
          <View style={[p_style.actionBtnIcon, {marginRight: 10}]}>
            <LocalAudioMute btnText=" " variant="text" />
          </View>
          <View style={p_style.actionBtnIcon}>
            <LocalVideoMute btnText=" " variant="text" />
          </View>
        </LocalUserContext>
      </View>
    </View>
  );
};
export default MeParticipant;

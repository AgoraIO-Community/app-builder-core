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
import {ButtonTemplateName} from '../../utils/useButtonTemplate';
import LocalAudioMute from '../../subComponents/LocalAudioMute';
import LocalVideoMute from '../../subComponents/LocalVideoMute';
import ParticipantName from './ParticipantName';

const MeParticipant = (props: any) => {
  const {p_style, name} = props;

  return (
    <View style={p_style.participantRow}>
      <ParticipantName value={name} />
      <View style={p_style.participantActionContainer}>
        <View style={[p_style.actionBtnIcon, {marginRight: 10}]}>
          <LocalAudioMute buttonTemplateName={ButtonTemplateName.topBar} />
        </View>
        {!$config.AUDIO_ROOM && (
          <View style={p_style.actionBtnIcon}>
            <LocalVideoMute buttonTemplateName={ButtonTemplateName.topBar} />
          </View>
        )}
      </View>
    </View>
  );
};
export default MeParticipant;

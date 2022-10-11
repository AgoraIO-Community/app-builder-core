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
import {View, Text, StyleSheet} from 'react-native';
import {ButtonTemplateName} from '../../utils/useButtonTemplate';
import LocalAudioMute from '../../subComponents/LocalAudioMute';
import LocalVideoMute from '../../subComponents/LocalVideoMute';
import ParticipantName from './ParticipantName';
import UserAvatar from '../../atoms/UserAvatar';

const MeParticipant = (props: any) => {
  const {p_style, name, isHost} = props;
  const containerStyle = {
    background: '#021F3380',
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  };
  const textStyle = {
    fontSize: 12,
    lineHeight: 10,
    fontWeight: 400,
    color: '#fff',
  };

  return (
    <View style={p_style.participantRow}>
      <View style={styles.nameContainer}>
        <UserAvatar
          name={name}
          containerStyle={containerStyle}
          textStyle={textStyle}
        />
        <View>
          <ParticipantName value={name} />
          <Text style={styles.subText}>{isHost && 'Host, '}Me</Text>
        </View>
      </View>
      <View style={p_style.participantActionContainer}>
        {!$config.AUDIO_ROOM && (
          <View style={[p_style.actionBtnIcon, {marginRight: 16}]}>
            <LocalVideoMute buttonTemplateName={ButtonTemplateName.topBar} />
          </View>
        )}
        <View style={[p_style.actionBtnIcon]}>
          <LocalAudioMute buttonTemplateName={ButtonTemplateName.topBar} />
        </View>
      </View>
    </View>
  );
};
export default MeParticipant;

const styles = StyleSheet.create({
  subText: {
    fontSize: 12,
    lineHeight: 12,
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    color: '#858585',
    marginTop: 4,
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

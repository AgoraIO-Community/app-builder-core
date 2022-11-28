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
import UserAvatar from '../../atoms/UserAvatar';

const ScreenshareParticipants = (props: {name: string}) => {
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
    fontWeight: '400',
    color: '#fff',
  };
  const {name} = props;
  return (
    <View style={styles.container}>
      <View style={styles.userInfoContainer}>
        <UserAvatar
          name={name}
          containerStyle={containerStyle}
          textStyle={textStyle}
        />
        <View style={{alignSelf: 'center'}}>
          <Text style={styles.participantNameText}>{name}</Text>
        </View>
      </View>
    </View>
  );
};
export default ScreenshareParticipants;
const styles = StyleSheet.create({
  participantNameText: {
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
    fontFamily: 'Source Sans Pro',
    flexDirection: 'row',
    color: $config.PRIMARY_FONT_COLOR,
    textAlign: 'left',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userInfoContainer: {
    flexDirection: 'row',
    flex: 0.7,
  },
  iconContainer: {
    flex: 0.3,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignSelf: 'center',
  },
});

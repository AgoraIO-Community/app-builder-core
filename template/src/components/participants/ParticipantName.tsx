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
import {View, StyleSheet, useWindowDimensions, Platform} from 'react-native';
import TextWithToolTip from '../../subComponents/TextWithTooltip';
import {RFValue} from 'react-native-responsive-fontsize';

const ParticipantName = ({value}: {value: string}) => {
  const {height, width} = useWindowDimensions();
  const fontSize = Platform.OS === 'web' ? 14 : 16;
  return (
    <View style={{flex: 1}}>
      <TextWithToolTip
        value={value}
        style={[
          style.participantText,
          {
            fontSize: RFValue(fontSize, height > width ? height : width),
          },
        ]}
      />
    </View>
  );
};
export default ParticipantName;

const style = StyleSheet.create({
  participantText: {
    flex: 1,
    fontWeight: '500',
    flexDirection: 'row',
    color: $config.PRIMARY_FONT_COLOR,
    lineHeight: 20,
    paddingHorizontal: 5,
    textAlign: 'left',
    flexShrink: 1,
  },
});

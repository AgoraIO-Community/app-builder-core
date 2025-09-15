/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the "Materials") are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.'s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import BreakoutRoomNameRenderer from '../hoc/BreakoutRoomNameRenderer';
import ImageIcon from '../../../atoms/ImageIcon';
import ThemeConfig from '../../../theme';
import {trimText} from '../../../utils/common';

const BreakoutMeetingTitle: React.FC = () => {
  return (
    <BreakoutRoomNameRenderer>
      {({breakoutRoomName}) =>
        trimText(breakoutRoomName) ? (
          <View style={styles.breakoutRoomNameView}>
            <ImageIcon
              iconType="plain"
              name={'open-room'}
              iconSize={12}
              tintColor={$config.SECONDARY_ACTION_COLOR}
            />
            <Text
              style={styles.breakoutRoomNameText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {trimText(breakoutRoomName)}
            </Text>
          </View>
        ) : null
      }
    </BreakoutRoomNameRenderer>
  );
};

const styles = StyleSheet.create({
  breakoutRoomNameView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  breakoutRoomNameText: {
    fontSize: ThemeConfig.FontSize.tiny,
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});

export default BreakoutMeetingTitle;

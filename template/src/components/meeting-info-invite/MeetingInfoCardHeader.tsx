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
import {View, StyleSheet, Text} from 'react-native';
import IDPLogoutComponent from '../../auth/IDPLogoutComponent';
import Spacer from '../../atoms/Spacer';
import {isMobileUA, isValidReactComponent, trimText} from '../../utils/common';
import ThemeConfig from '../../theme';

interface MeetingInfoCardHeaderProps {
  avatar?: React.ReactNode;
  children: React.ReactNode;
}

export const MeetingInfoCardHeader = (props: MeetingInfoCardHeaderProps) => {
  const {avatar, children} = props;
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {isMobileUA() ? (
          <IDPLogoutComponent containerStyle={{marginTop: 0, marginRight: 0}} />
        ) : (
          <></>
        )}
      </View>
      <Spacer size={20} />
      <View style={style.flexRow}>
        {React.isValidElement(avatar) && (
          <View style={style.avatar}>{avatar}</View>
        )}
        <View style={style.header}>{children}</View>
      </View>

      <Spacer size={40} />
    </View>
  );
};

export default MeetingInfoCardHeader;

export const style = StyleSheet.create({
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 5,
  },
  header: {
    marginTop: 2,
  },
  heading: {
    fontSize: ThemeConfig.FontSize.extraLarge,
    fontWeight: '700',
    lineHeight: ThemeConfig.FontSize.extraLarge,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    paddingVertical: 2,
  },
  subheading: {
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '400',
    lineHeight: ThemeConfig.FontSize.small,
    color: '#ffffffcc',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    paddingVertical: 2,
  },
});

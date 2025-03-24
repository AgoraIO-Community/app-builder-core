import React from 'react';
import {Text} from 'react-native';
import ToolbarItem from '../../../atoms/ToolbarItem';
import {useRoomInfo} from './../../room-info/useRoomInfo';
import {trimText} from '../../../utils/common';
import ThemeConfig from '../../../theme';

export const MeetingTitleToolbarItem = () => {
  const {
    data: {meetingTitle},
  } = useRoomInfo();
  return (
    <ToolbarItem>
      <Text
        style={{
          alignSelf: 'center',
          fontSize: ThemeConfig.FontSize.normal,
          color: $config.FONT_COLOR,
          fontWeight: '600',
          fontFamily: ThemeConfig.FontFamily.sansPro,
        }}
        testID="videocall-meetingName"
        numberOfLines={1}
        ellipsizeMode="tail">
        {trimText(meetingTitle)}
      </Text>
    </ToolbarItem>
  );
};

import React from 'react';
import {Text, StyleSheet, View, TextStyle} from 'react-native';
import {trimText} from '../../utils/common';
import ThemeConfig from '../../theme';
import {useRoomInfo} from '../room-info/useRoomInfo';

export interface MeetingTitleProps {
  textStyle?: TextStyle;
  prefix?: string;
}
const MeetingTitle = (props?: MeetingTitleProps) => {
  const {
    data: {meetingTitle},
  } = useRoomInfo();
  return (
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={[style.titleHeading, props?.textStyle ? props.textStyle : {}]}>
      {props.prefix} {trimText(meetingTitle)}
    </Text>
  );
};

export default MeetingTitle;

const style = StyleSheet.create({
  titleHeading: {
    fontSize: ThemeConfig.FontSize.large,
    lineHeight: 28,
    fontWeight: '600',
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});

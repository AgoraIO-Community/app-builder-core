import React from 'react';
import {Text, StyleSheet, View, TextStyle} from 'react-native';
import ThemeConfig from '../../theme';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';

export interface MeetingTitleProps {
  textStyle?: TextStyle;
}
const MeetingTitle = (props?: MeetingTitleProps) => {
  const {
    data: {meetingTitle},
  } = useMeetingInfo();
  return (
    <Text style={[style.titleHeading, props?.textStyle ? props.textStyle : {}]}>
      {meetingTitle?.substring(0, 25) +
        (meetingTitle?.length > 25 ? '...' : '')}
    </Text>
  );
};

export default MeetingTitle;

const style = StyleSheet.create({
  titleHeading: {
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: ThemeConfig.FontSize.normal,
    fontWeight: '600',
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    textTransform: 'capitalize',
  },
});

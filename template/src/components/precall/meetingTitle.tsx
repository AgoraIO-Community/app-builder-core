import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';

const MeetingTitle: React.FC = () => {
  const {
    data: {meetingTitle},
  } = useMeetingInfo();
  return <Text style={[style.titleHeading]}>{meetingTitle}</Text>;
};

export default MeetingTitle;

const style = StyleSheet.create({
  titleHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: $config.PRIMARY_FONT_COLOR,
    fontFamily: 'Source Sans Pro',
  },
});

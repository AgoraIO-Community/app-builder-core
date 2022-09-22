import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';

const MeetingTitle: React.FC = () => {
  const {
    data: {meetingTitle},
  } = useMeetingInfo();
  return (
    <>
      <Text style={[style.titleHeading, {color: $config.PRIMARY_COLOR}]}>
        {meetingTitle}
      </Text>
      <View style={{height: 50}} />
    </>
  );
};

export default MeetingTitle;

const style = StyleSheet.create({
  titleHeading: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: $config.SECONDARY_FONT_COLOR,
  },
});

import {useFpe} from 'fpe-api';
import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {isValidReactComponent} from '../../utils/common';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';

const MeetingTitle: React.FC = () => {
  const {meetingTitle} = useMeetingInfo();

  const {MeetingTitleAfterView, MeetingTitleBeforeView} = useFpe((data) => {
    let components: {
      MeetingTitleAfterView: React.ComponentType;
      MeetingTitleBeforeView: React.ComponentType;
    } = {
      MeetingTitleAfterView: React.Fragment,
      MeetingTitleBeforeView: React.Fragment,
    };
    if (
      data?.components?.precall &&
      typeof data?.components?.precall === 'object'
    ) {
      if (
        data?.components?.precall?.meetingName &&
        typeof data?.components?.precall?.meetingName === 'object'
      ) {
        if (
          data?.components?.precall?.meetingName?.before &&
          isValidReactComponent(data?.components?.precall?.meetingName?.before)
        ) {
          components.MeetingTitleBeforeView =
            data?.components?.precall?.meetingName?.before;
        }
        if (
          data?.components?.precall?.meetingName?.after &&
          isValidReactComponent(data?.components?.precall?.meetingName?.after)
        ) {
          components.MeetingTitleAfterView =
            data?.components?.precall?.meetingName?.after;
        }
      }
    }
    return components;
  });

  return (
    <>
      <MeetingTitleBeforeView />
      <Text style={[style.titleHeading, {color: $config.PRIMARY_COLOR}]}>
        {meetingTitle}
      </Text>
      <MeetingTitleAfterView />
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

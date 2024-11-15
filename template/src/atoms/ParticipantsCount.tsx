import React, {useContext} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {numFormatter} from '../utils/index';
import ChatContext from '../components/ChatContext';
import {useLiveStreamDataContext} from '../components/contexts/LiveStreamDataContext';
import {useVideoMeetingData} from '../components/contexts/VideoMeetingDataContext';
import {isMobileUA} from '../utils/common';
import {useString} from '../utils/useString';
import {
  videoRoomPeopleCountTooltipAttendeeText,
  videoRoomPeopleCountTooltipHostText,
} from '../language/default-labels/videoCallScreenLabels';

const ParticipantsCount = () => {
  const {onlineUsersCount} = useContext(ChatContext);
  const {audienceUids, hostUids} = useLiveStreamDataContext();
  const {attendeeUids, hostUids: hostUidsVM} = useVideoMeetingData();
  const count = $config.EVENT_MODE
    ? hostUids.length + audienceUids.length
    : onlineUsersCount;

  const hostlabel = useString(videoRoomPeopleCountTooltipHostText)();
  const attendeelabel = useString<{eventMode: boolean}>(
    videoRoomPeopleCountTooltipAttendeeText,
  );
  return (
    <IconButton
      placement="right"
      isClickable={isMobileUA() ? true : false}
      toolTipMessage={
        $config.EVENT_MODE
          ? `${hostlabel}: ${
              $config.EVENT_MODE
                ? hostUids?.length || 0
                : hostUidsVM.length || 0
            }\n${attendeelabel({eventMode: $config.EVENT_MODE})}: ${
              $config.EVENT_MODE
                ? audienceUids.length || 0
                : attendeeUids?.length || 0
            }`
          : ''
      }
      containerStyle={styles.participantCountView}
      disabled={true}
      iconProps={{
        name: 'people',
        iconType: 'plain',
        iconSize: 20,
        tintColor: $config.FONT_COLOR + hexadecimalTransparency['50%'],
      }}
      btnTextProps={{
        text: numFormatter(count),
        textColor: $config.FONT_COLOR + hexadecimalTransparency['50%'],
        textStyle: {
          fontFamily: 'Source Sans Pro',
          fontWeight: '600',
          fontSize: 12,
          lineHeight: 12,
          marginTop: 0,
          marginLeft: 4,
        },
      }}
    />
  );
};

export default ParticipantsCount;

const styles = StyleSheet.create({
  participantCountView: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
});

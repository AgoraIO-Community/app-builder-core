import React, {useContext} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {numFormatter} from '../utils/index';
import ChatContext from '../components/ChatContext';
import {useLiveStreamDataContext} from '../components/contexts/LiveStreamDataContext';
import {useVideoMeetingData} from '../components/contexts/VideoMeetingDataContext';
import {isMobileUA} from '../utils/common';

const ParticipantsCount = () => {
  const {onlineUsersCount} = useContext(ChatContext);
  const {audienceUids, hostUids} = useLiveStreamDataContext();
  const {attendeeUids, hostUids: hostUidsVM} = useVideoMeetingData();
  return (
    <IconButton
      placement="right"
      isClickable={isMobileUA() ? true : false}
      toolTipMessage={
        $config.EVENT_MODE
          ? `Host: ${
              $config.EVENT_MODE
                ? hostUids?.length || 0
                : hostUidsVM.length || 0
            }\n${$config.EVENT_MODE ? 'Audience: ' : 'Attendee: '}${
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
        text: numFormatter(onlineUsersCount),
        textColor: $config.FONT_COLOR + hexadecimalTransparency['50%'],
        textStyle: {
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
    padding: 12,
    paddingVertical: isMobileUA ? 5 : 12,
    backgroundColor: $config.ICON_BG_COLOR,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
});

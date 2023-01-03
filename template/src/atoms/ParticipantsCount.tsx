import React, {useContext} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {numFormatter} from '../utils/index';
import ChatContext from '../components/ChatContext';
import {useLiveStreamDataContext} from '../components/contexts/LiveStreamDataContext';

const ParticipantsCount = () => {
  const {onlineUsersCount} = useContext(ChatContext);
  const {audienceUids, hostUids} = useLiveStreamDataContext();
  return (
    <IconButton
      toolTipMessage={
        $config.EVENT_MODE
          ? `${'Host: ' + hostUids?.length || 0} \n` +
            `${'Audience: ' + audienceUids?.length || 0}`
          : ''
      }
      containerStyle={styles.participantCountView}
      disabled={true}
      iconProps={{
        name: 'people',
        iconType: 'plain',
        iconSize: 20,
        tintColor:
          $config.SECONDARY_ACTION_COLOR + hexadecimalTransparency['50%'],
      }}
      btnTextProps={{
        text: numFormatter(onlineUsersCount),
        textColor:
          $config.SECONDARY_ACTION_COLOR + hexadecimalTransparency['50%'],
        textStyle: {
          fontWeight: '600',
          fontSize: 16,
          marginTop: 0,
          marginLeft: 6,
        },
      }}
    />
  );
};

export default ParticipantsCount;

const styles = StyleSheet.create({
  participantCountView: {
    flexDirection: 'row',
    padding: 10,
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

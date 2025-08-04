import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import BreakoutRoomParticipants from './BreakoutRoomParticipants';
import SelectParticipantAssignmentStrategy from './SelectParticipantAssignmentStrategy';
import Divider from '../../common/Dividers';
import Toggle from '../../../atoms/Toggle';
import ThemeConfig from '../../../theme';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';
import {useLocalUid} from '../../../../agora-rn-uikit';
import {useContent} from '../../../../customization-api';
import {RoomAssignmentStrategy} from '../state/reducer';

export default function BreakoutRoomSettings() {
  const {assignmentStrategy, assignParticipants} = useBreakoutRoom();
  const {defaultContent, activeUids} = useContent();
  const localUid = useLocalUid();

  // Filter active UIDs to exclude:
  // 1. Custom content (not type 'rtc')
  // 2. Screenshare UIDs
  // 3. Offline users
  const filteredParticipants = activeUids
    .filter(uid => {
      const user = defaultContent[uid];
      if (!user) {
        return false;
      }
      // Only include RTC users
      if (user.type !== 'rtc') {
        return false;
      }
      // Exclude offline users
      if (user.offline) {
        return false;
      }
      // Exclude screenshare UIDs (they typically have a parentUid)
      if (user.parentUid) {
        return false;
      }
      return true;
    })
    .map(uid => ({
      uid,
      user: defaultContent[uid],
    }));

  // Sort participants with local user first
  const sortedParticipants = filteredParticipants.sort((a, b) => {
    if (a.uid === localUid) {
      return -1;
    }
    if (b.uid === localUid) {
      return 1;
    }
    return 0;
  });

  const onStrategyChange = (strategy: RoomAssignmentStrategy) => {
    const uids = sortedParticipants.map(item => item.uid);
    assignParticipants(strategy, uids);
  };

  return (
    <View style={style.card}>
      {/* Avatar list  */}
      <View style={style.section}>
        <BreakoutRoomParticipants participants={sortedParticipants} />
      </View>
      <Divider />
      <View style={style.section}>
        <SelectParticipantAssignmentStrategy
          selectedStrategy={assignmentStrategy}
          onStrategyChange={onStrategyChange}
        />
      </View>
      <Divider />
      <View style={style.section}>
        <View style={style.switchSection}>
          <Text style={style.label}>Allow people to switch rooms</Text>
          <Toggle
            disabled={$config.EVENT_MODE}
            isEnabled={true}
            toggleSwitch={() => {}}
            circleColor={$config.FONT_COLOR}
          />
        </View>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  card: {
    width: '100%',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderColor: $config.CARD_LAYER_3_COLOR,
    gap: 12,
  },
  section: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  switchSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});

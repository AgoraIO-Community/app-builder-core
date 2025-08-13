import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import ImageIcon from '../../../atoms/ImageIcon';
import TertiaryButton from '../../../atoms/TertiaryButton';
import ThemeConfig from '../../../theme';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';

export default function BreakoutRoomRaiseHand() {
  const {raiseMyHand} = useBreakoutRoom();
  return (
    <View style={style.card}>
      <View style={style.cardHeader}>
        <ImageIcon
          iconType="plain"
          name="info"
          iconSize={20}
          tintColor={$config.SECONDARY_ACTION_COLOR}
        />
        <Text style={style.infoText}>
          Please wait, the meeting host will assign you to a room shortly.
        </Text>
      </View>
      <View style={style.cardFooter}>
        <TertiaryButton
          containerStyle={style.raiseHandBtn}
          textStyle={style.raiseHandBtnText}
          text={'✋ Raise Hand'}
          onPress={() => {
            raiseMyHand();
          }}
        />
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
    gap: 16,
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  cardFooter: {
    display: 'flex',
    flex: 1,
    width: '100%',
  },
  infoText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.tiny,
    fontWeight: '400',
    lineHeight: 16,
  },
  raiseHandBtn: {
    width: '100%',
    borderRadius: 4,
    borderColor: $config.SECONDARY_ACTION_COLOR,
    backgroundColor: 'transparent',
  },
  raiseHandBtnText: {
    textAlign: 'center',
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
  },
});

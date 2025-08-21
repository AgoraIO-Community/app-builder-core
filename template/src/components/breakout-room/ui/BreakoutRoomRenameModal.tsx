import React, {SetStateAction, Dispatch} from 'react';
import {View, StyleSheet, TextInput, Text} from 'react-native';
import GenericModal from '../../common/GenericModal';
import ThemeConfig from '../../../theme';
import TertiaryButton from '../../../atoms/TertiaryButton';

interface BreakoutRoomRenameModalProps {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  currentRoomName: string;
  updateRoomName: (newName: string) => void;
}

export default function BreakoutRoomRenameModal(
  props: BreakoutRoomRenameModalProps,
) {
  const {currentRoomName, setModalOpen, updateRoomName} = props;
  const [roomName, setRoomName] = React.useState(currentRoomName);

  const disabled = roomName.trim() === '';

  return (
    <GenericModal
      visible={true}
      onRequestClose={() => setModalOpen(false)}
      showCloseIcon={true}
      title={'Rename Room'}
      cancelable={true}
      contentContainerStyle={style.contentContainer}>
      <View style={style.fullBody}>
        <View style={style.mbody}>
          <View style={style.form}>
            <Text style={style.label}>Room name</Text>
            <TextInput
              id="room-rename-text"
              style={style.inputBox}
              value={roomName}
              onChangeText={setRoomName}
              placeholder="Rename room..."
              placeholderTextColor={
                $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low
              }
              underlineColorAndroid="transparent"
            />
          </View>
        </View>
        <View style={style.mfooter}>
          <View>
            <TertiaryButton
              containerStyle={style.cancelBtn}
              textStyle={style.actionBtnText}
              text={'Cancel'}
              onPress={() => {
                setModalOpen(false);
              }}
            />
          </View>
          <View>
            <TertiaryButton
              containerStyle={disabled ? style.disabledSendBtn : style.sendBtn}
              textStyle={style.actionBtnText}
              text={'Save'}
              disabled={disabled}
              onPress={() => {
                updateRoomName(roomName);
              }}
            />
          </View>
        </View>
      </View>
    </GenericModal>
  );
}

const style = StyleSheet.create({
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 0,
    width: '100%',
    maxWidth: 500,
    height: 235,
  },
  fullBody: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  mbody: {
    padding: 12,
    borderTopColor: $config.CARD_LAYER_3_COLOR,
    borderTopWidth: 1,
    borderBottomColor: $config.CARD_LAYER_3_COLOR,
    borderBottomWidth: 1,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  mfooter: {
    padding: 12,
    gap: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  label: {
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '500',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    lineHeight: 16,
  },
  inputBox: {
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '400',
    color: $config.FONT_COLOR,
    padding: 20,
    lineHeight: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    outline: 'none',
  },
  actionBtnText: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
  },
  cancelBtn: {
    borderRadius: 4,
    minWidth: 140,
    borderColor: $config.SECONDARY_ACTION_COLOR,
    backgroundColor: 'transparent',
  },
  sendBtn: {
    borderRadius: 4,
    minWidth: 140,
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  disabledSendBtn: {
    borderRadius: 4,
    minWidth: 140,
    backgroundColor: $config.SEMANTIC_NEUTRAL,
  },
});

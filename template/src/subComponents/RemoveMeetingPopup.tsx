import React, {SetStateAction} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Spacer from '../atoms/Spacer';
import Popup from '../atoms/Popup';
import TertiaryButton from '../atoms/TertiaryButton';
import PrimaryButton from '../atoms/PrimaryButton';
import ThemeConfig from '../theme';

interface RemoveMeetingPopupProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  removeUserFromMeeting: () => void;
  username: string;
}
const RemoveMeetingPopup = (props: RemoveMeetingPopupProps) => {
  const removeMeetingLabelHeading = 'Remove ' + props.username + '?';
  const removeMeetingLabelSubHeading = `Once removed, ${props.username} will still be able to rejoin the meeting later.`;

  const cancelBtnLabel = 'CANCEL';
  const removeBtnLabel = 'REMOVE';
  return (
    <Popup
      modalVisible={props.modalVisible}
      setModalVisible={props.setModalVisible}
      showCloseIcon={false}
      contentContainerStyle={styles.contentContainer}>
      <Text style={styles.heading}>{removeMeetingLabelHeading}</Text>
      <Spacer size={8} />
      <Text style={styles.subHeading}>{removeMeetingLabelSubHeading}</Text>
      <Spacer size={32} />
      <View style={styles.btnContainer}>
        <View style={{justifyContent: 'center', alignSelf: 'center'}}>
          <TertiaryButton
            containerStyle={{
              height: 46,
              justifyContent: 'center',
            }}
            text={cancelBtnLabel}
            onPress={() => props.setModalVisible(false)}
          />
        </View>
        <View
          style={{
            marginLeft: 16,
            justifyContent: 'center',
            alignSelf: 'center',
          }}>
          <PrimaryButton
            containerStyle={{
              backgroundColor: $config.SEMANTIC_ERROR,
              height: 48,
              minWidth: 200,
            }}
            text={removeBtnLabel}
            onPress={props.removeUserFromMeeting}
          />
        </View>
      </View>
    </Popup>
  );
};

export default RemoveMeetingPopup;

const styles = StyleSheet.create({
  btnContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  contentContainer: {
    padding: 24,
    maxWidth: 342,
  },
  heading: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: $config.SEMANTIC_ERROR,
  },
  subHeading: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    color: $config.FONT_COLOR,
  },
});

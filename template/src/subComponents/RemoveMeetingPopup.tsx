import React, {SetStateAction, useContext} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Spacer from '../atoms/Spacer';
import Popup from '../atoms/Popup';
import TertiaryButton from '../atoms/TertiaryButton';
import PrimaryButton from '../atoms/PrimaryButton';
import ThemeConfig from '../theme';
import DimensionContext from '../components/dimension/DimensionContext';

interface RemoveMeetingPopupProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  removeUserFromMeeting: () => void;
  username: string;
}
const RemoveMeetingPopup = (props: RemoveMeetingPopupProps) => {
  const {getDimensionData} = useContext(DimensionContext);
  const {isDesktop} = getDimensionData();
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
      <View style={isDesktop ? styles.btnContainer : styles.btnContainerMobile}>
        <TertiaryButton
          containerStyle={{
            paddingVertical: 12,
          }}
          textStyle={styles.btnText}
          text={cancelBtnLabel}
          onPress={() => props.setModalVisible(false)}
        />

        <PrimaryButton
          containerStyle={{
            backgroundColor: $config.SEMANTIC_ERROR,
            paddingVertical: 12,
            minWidth: 180,
            marginBottom: isDesktop ? 0 : 20,
          }}
          textStyle={styles.btnText}
          text={removeBtnLabel}
          onPress={props.removeUserFromMeeting}
        />
      </View>
    </Popup>
  );
};

export default RemoveMeetingPopup;

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentContainer: {
    padding: 24,
    maxWidth: 342,
  },
  btnText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },

  btnContainerMobile: {
    flexDirection: 'column-reverse',
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

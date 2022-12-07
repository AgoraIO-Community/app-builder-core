import React, {SetStateAction, useContext} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Spacer from '../atoms/Spacer';
import Popup from '../atoms/Popup';
import TertiaryButton from '../atoms/TertiaryButton';
import PrimaryButton from '../atoms/PrimaryButton';
import ThemeConfig from '../theme';
import DimensionContext from '../components/dimension/DimensionContext';

interface EndcallPopupProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  endCall: () => void;
}
const EndcallPopup = (props: EndcallPopupProps) => {
  const {getDimensionData} = useContext(DimensionContext);
  const {isDesktop} = getDimensionData();
  const leaveMeetingLabelHeading = 'Leave Meeting?';
  const leaveMeetingLabelSubHeading =
    'Are you sure you want to leave this meeting?';

  const stayBtnLabel = 'STAY';
  const leaveBtnLabel = 'LEAVE';
  return (
    <Popup
      modalVisible={props.modalVisible}
      setModalVisible={props.setModalVisible}
      showCloseIcon={false}
      contentContainerStyle={styles.contentContainer}>
      <Text style={styles.heading}>{leaveMeetingLabelHeading}</Text>
      <Spacer size={8} />
      <Text style={styles.subHeading}>{leaveMeetingLabelSubHeading}</Text>
      <Spacer size={32} />
      <View style={isDesktop ? styles.btnContainer : styles.btnContainerMobile}>
        <TertiaryButton
          containerStyle={{
            paddingVertical: 12,
          }}
          text={stayBtnLabel}
          textStyle={styles.btnText}
          onPress={() => props.setModalVisible(false)}
        />

        <PrimaryButton
          containerStyle={{
            backgroundColor: $config.SEMANTIC_ERROR,
            paddingVertical: 12,
            minWidth: 210,
            marginBottom: isDesktop ? 0 : 20,
          }}
          text={leaveBtnLabel}
          textStyle={styles.btnText}
          onPress={props.endCall}
        />
      </View>
    </Popup>
  );
};

export default EndcallPopup;

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },

  btnContainerMobile: {
    flexDirection: 'column-reverse',
  },
  contentContainer: {
    padding: 24,
    minWidth: 342,
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
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 20,
    letterSpacing: 0.25,
    color: $config.FONT_COLOR,
  },
});

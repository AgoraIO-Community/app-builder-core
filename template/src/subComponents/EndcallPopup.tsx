import React, {SetStateAction} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Spacer from '../atoms/Spacer';
import Popup from '../atoms/Popup';
import TertiaryButton from '../atoms/TertiaryButton';
import PrimaryButton from '../atoms/PrimaryButton';

interface EndcallPopupProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  endCall: () => void;
}
const EndcallPopup = (props: EndcallPopupProps) => {
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
      <View style={styles.btnContainer}>
        <View style={{justifyContent: 'center', alignSelf: 'center'}}>
          <TertiaryButton
            containerStyle={{
              height: 46,
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#000000',
            }}
            text={stayBtnLabel}
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
            containerStyle={{backgroundColor: '#FF414D', height: 48}}
            text={leaveBtnLabel}
            onPress={props.endCall}
          />
        </View>
      </View>
    </Popup>
  );
};

export default EndcallPopup;

const styles = StyleSheet.create({
  btnContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  contentContainer: {
    padding: 24,
    minWidth: 342,
  },
  heading: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: 0.15,
    color: '#FF414D',
  },
  subHeading: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    color: 'rgba(0, 0, 0, 0.8)',
  },
});

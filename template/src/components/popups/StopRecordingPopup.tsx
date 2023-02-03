import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Spacer from '../../atoms/Spacer';
import Popup from '../../atoms/Popup';
import TertiaryButton from '../../atoms/TertiaryButton';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import {useIsDesktop} from '../../utils/common';
import {useRecording} from 'customization-api';
import {useVideoCall} from '../useVideoCall';

const StopRecordingPopup = () => {
  const {showStopRecordingPopup, setShowStopRecordingPopup} = useVideoCall();
  const {stopRecording, isRecordingActive} = useRecording();
  const isDesktop = useIsDesktop()('popup');
  const recordingLabelHeading = 'Stop Recording?';
  const recordingLabelSubHeading =
    'Are you sure you want to stop recording? You can’t undo this action.';

  const cancelBtnLabel = 'CANCEL';
  const stopRecordingBtnLabel = 'END RECORDING';

  const doStopRecording = () => {
    if (isRecordingActive) {
      stopRecording && stopRecording();
      setShowStopRecordingPopup(false);
    }
  };
  return (
    <Popup
      modalVisible={showStopRecordingPopup}
      setModalVisible={setShowStopRecordingPopup}
      showCloseIcon={false}
      contentContainerStyle={styles.contentContainer}>
      <Text style={styles.heading}>{recordingLabelHeading}</Text>
      <Spacer size={8} />
      <Text style={styles.subHeading}>{recordingLabelSubHeading}</Text>
      <Spacer size={32} />
      <View style={isDesktop ? styles.btnContainer : styles.btnContainerMobile}>
        <View style={isDesktop && {flex: 1}}>
          <TertiaryButton
            containerStyle={{
              minWidth: 'auto',
              width: isDesktop ? 90 : '100%',
              height: 48,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: ThemeConfig.BorderRadius.medium,
            }}
            textStyle={styles.btnText}
            text={cancelBtnLabel}
            onPress={() => setShowStopRecordingPopup(false)}
          />
        </View>
        <Spacer
          size={isDesktop ? 10 : 20}
          horizontal={isDesktop ? true : false}
        />
        <View style={isDesktop && {flex: 2}}>
          <PrimaryButton
            containerStyle={{
              minWidth: 'auto',
              width: '100%',
              borderRadius: ThemeConfig.BorderRadius.medium,
              height: 48,
              backgroundColor: $config.SEMANTIC_ERROR,
              paddingVertical: 12,
              paddingHorizontal: 12,
            }}
            textStyle={styles.btnText}
            text={stopRecordingBtnLabel}
            onPress={doStopRecording}
          />
        </View>
      </View>
    </Popup>
  );
};

export default StopRecordingPopup;

const styles = StyleSheet.create({
  btnContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    maxWidth: 342,
  },
  heading: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: 22,
    color: $config.SEMANTIC_ERROR,
  },
  subHeading: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    color: $config.FONT_COLOR,
  },
});

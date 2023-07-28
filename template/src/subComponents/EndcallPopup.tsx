import React, {SetStateAction, useContext} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Spacer from '../atoms/Spacer';
import Popup from '../atoms/Popup';
import TertiaryButton from '../atoms/TertiaryButton';
import PrimaryButton from '../atoms/PrimaryButton';
import ThemeConfig from '../theme';
import {useIsDesktop} from '../utils/common';
import DownloadTranscriptBtn from './caption/DownloadTranscriptBtn';

interface EndcallPopupProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  endCall: () => void;
}
const EndcallPopup = (props: EndcallPopupProps) => {
  const isDesktop = useIsDesktop()('popup');
  const leaveMeetingLabelHeading = 'Leave Meeting?';
  const leaveMeetingLabelSubHeading =
    'Are you sure you want to leave this meeting?';

  const stayBtnLabel = 'CANCEL';
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
        {isDesktop && (
          <DownloadTranscriptBtn
            textStyle={{textTransform: 'uppercase'}}
            containerStyle={styles.downloadBtn}
          />
        )}

        <View style={isDesktop && {flex: 1}}>
          <TertiaryButton
            containerStyle={{
              width: '100%',
              height: 48,
              paddingVertical: 8,
              paddingHorizontal: 40,
              borderRadius: ThemeConfig.BorderRadius.medium,
            }}
            text={stayBtnLabel}
            textStyle={styles.btnText}
            onPress={() => props.setModalVisible(false)}
          />
        </View>
        <Spacer
          size={isDesktop ? 10 : 20}
          horizontal={isDesktop ? true : false}
        />
        <View style={isDesktop && {flex: 1}}>
          <PrimaryButton
            containerStyle={{
              minWidth: 'auto',
              width: '100%',
              borderRadius: ThemeConfig.BorderRadius.medium,
              height: 48,
              backgroundColor: $config.SEMANTIC_ERROR,
              paddingVertical: 8,
              paddingHorizontal: 36,
            }}
            text={leaveBtnLabel}
            textStyle={styles.btnText}
            onPress={props.endCall}
          />
        </View>
        {!isDesktop && (
          <>
            <DownloadTranscriptBtn
              textStyle={{textTransform: 'uppercase'}}
              containerStyle={
                [styles.downloadBtn, {marginBottom: 20}] as Object
              }
            />
          </>
        )}
      </View>
    </Popup>
  );
};

export default EndcallPopup;

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
    minWidth: 342,
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
  downloadBtn: {
    minWidth: 215,
  },
});

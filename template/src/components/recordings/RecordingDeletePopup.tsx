import React, {SetStateAction} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Spacer from '../../atoms/Spacer';
import Popup from '../../atoms/Popup';
import TertiaryButton from '../../atoms/TertiaryButton';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import {useIsDesktop} from '../../utils/common';
import {useString} from '../../utils/useString';
import {cancelText} from '../../language/default-labels/commonLabels';

interface RecordingDeletePopupProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
  onCancel: () => void;
}
const RecordingDeletePopup = (props: RecordingDeletePopupProps) => {
  const isDesktop = useIsDesktop()('popup');
  const heading = 'DELETE';
  const subheading =
    "Are you sure want to delete the recording? This action can't be undone.";

  const cancelBtnLabel = useString(cancelText)();
  const deleteBtnLabel = 'DELETE';
  return (
    <Popup
      modalVisible={props.modalVisible}
      setModalVisible={props.setModalVisible}
      showCloseIcon={false}
      contentContainerStyle={styles.contentContainer}>
      <Text style={styles.heading}>{heading}</Text>
      <Spacer size={8} />
      <Text style={styles.subHeading}>{subheading}</Text>
      <Spacer size={32} />
      <View style={isDesktop ? styles.btnContainer : styles.btnContainerMobile}>
        <View style={isDesktop && {flex: 1}}>
          <TertiaryButton
            containerStyle={{
              width: '100%',
              height: 48,
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: ThemeConfig.BorderRadius.medium,
            }}
            textStyle={styles.btnText}
            text={cancelBtnLabel}
            onPress={() => {
              props?.setModalVisible(false);
              props?.onCancel();
            }}
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
              paddingVertical: 12,
              paddingHorizontal: 12,
            }}
            textStyle={styles.btnText}
            text={deleteBtnLabel}
            onPress={() => {
              props?.setModalVisible(false);
              props?.onConfirm();
            }}
          />
        </View>
      </View>
    </Popup>
  );
};

export default RecordingDeletePopup;

const styles = StyleSheet.create({
  btnContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: $config.SEMANTIC_ERROR,
  },
  subHeading: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: 14,
    color: $config.FONT_COLOR,
  },
});

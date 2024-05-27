import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  useWindowDimensions,
  TextStyle,
} from 'react-native';
import React, {SetStateAction} from 'react';

import {isMobileOrTablet} from 'customization-api';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import PlatformWrapper from '../../src/utils/PlatformWrapper';
import Spacer from './Spacer';
import ThemeConfig from '../../src/theme';

interface InlinePopupProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: React.Dispatch<SetStateAction<boolean>>;
  modalPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  onConfirmClick: () => void;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  cancelLabelStyle?: TextStyle;
  confirmLabelStyle?: TextStyle;
}

const InlinePopup = (props: InlinePopupProps) => {
  const {
    actionMenuVisible,
    setActionMenuVisible,
    modalPosition,
    message,
    cancelLabel,
    confirmLabel,
    onConfirmClick,
    cancelLabelStyle = {},
    confirmLabelStyle = {},
  } = props;
  const {height} = useWindowDimensions();
  return (
    <View>
      <Modal
        testID="action-menu"
        animationType="none"
        transparent={true}
        visible={actionMenuVisible}>
        <TouchableWithoutFeedback
          onPress={() => {
            setActionMenuVisible(false);
          }}>
          <View
            style={[
              styles.backDrop,
              isMobileOrTablet()
                ? {
                    backgroundColor:
                      $config.HARD_CODED_BLACK_COLOR +
                      hexadecimalTransparency['50%'],
                  }
                : {},
            ]}
          />
        </TouchableWithoutFeedback>
        <View
          style={
            isMobileOrTablet()
              ? [styles.modalViewUA, {marginTop: height / 3}]
              : [styles.modalView, modalPosition]
          }>
          <View style={styles.container}>
            <Text style={styles.messageStyle}>{message}</Text>
            <View style={styles.btnContainer}>
              <PlatformWrapper>
                {(isHovered: boolean) => {
                  return (
                    <TouchableOpacity
                      style={isHovered ? styles.onHoverBtnStyle : {}}
                      onPress={() => setActionMenuVisible(false)}>
                      <Text style={[styles.btnText, cancelLabelStyle]}>
                        {cancelLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              </PlatformWrapper>
              <Spacer size={8} horizontal={true} />
              <PlatformWrapper>
                {(isHovered: boolean) => {
                  return (
                    <TouchableOpacity
                      style={isHovered ? styles.onHoverBtnStyle : {}}
                      onPress={onConfirmClick}>
                      <Text style={[styles.btnText, confirmLabelStyle]}>
                        {confirmLabel}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              </PlatformWrapper>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default InlinePopup;

const styles = StyleSheet.create({
  onHoverBtnStyle: {
    backgroundColor: $config.CARD_LAYER_3_COLOR,
    borderRadius: 8,
  },
  container: {
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 14,
  },
  messageStyle: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.normal,
    color: $config.FONT_COLOR,
    paddingBottom: 18,
  },
  btnText: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.normal,
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalView: {
    position: 'absolute',
    width: 290,
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    borderRadius: 4,
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1,
    elevation: 1,
  },
  modalViewUA: {
    alignSelf: 'center',
    maxWidth: '80%',
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    borderRadius: 4,
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1,
    elevation: 1,
  },
  backDrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

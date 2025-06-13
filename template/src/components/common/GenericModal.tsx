import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  ModalProps,
  ViewStyle,
} from 'react-native';
import React from 'react';
import IconButton from '../../atoms/IconButton';
import ThemeConfig from '../../theme';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {isMobileUA, useIsDesktop} from '../../utils/common';

interface GenericModalProps extends ModalProps {
  title?: string;
  cancelable?: boolean;
  showCloseIcon?: boolean;
  contentContainerStyle?: ViewStyle;
}
const GenericModal = (props: GenericModalProps) => {
  const {
    visible,
    onRequestClose,
    title,
    children,
    cancelable = false,
    showCloseIcon = true,
    contentContainerStyle = {},
    ...modalProps
  } = props;

  const isDesktop = useIsDesktop()('popup');

  // Fallback Handle close
  const handleClose = () => {
    onRequestClose?.(undefined);
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}>
      <View style={[styles.centeredView, isDesktop && styles.desktopAlign]}>
        <TouchableWithoutFeedback
          onPress={() => {
            cancelable && handleClose();
          }}>
          <View style={styles.backDrop} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalView, contentContainerStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {showCloseIcon && (
              <View>
                <IconButton
                  hoverEffect={true}
                  hoverEffectStyle={{
                    backgroundColor: $config.ICON_BG_COLOR,
                    borderRadius: 20,
                  }}
                  iconProps={{
                    iconType: 'plain',
                    iconContainerStyle: {
                      padding: isMobileUA() ? 0 : 5,
                    },
                    name: 'close',
                    tintColor: $config.SECONDARY_ACTION_COLOR,
                  }}
                  onPress={handleClose}
                />
              </View>
            )}
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default GenericModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  desktopAlign: {
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    borderRadius: ThemeConfig.BorderRadius.large,
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 680,
    minWidth: 340,
    height: 620,
    maxHeight: 620,
    zIndex: 2,
  },
  backDrop: {
    zIndex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor:
      $config.HARD_CODED_BLACK_COLOR + hexadecimalTransparency['60%'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
  },
  title: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.xLarge,
    lineHeight: 32,
    fontWeight: '500',
    alignSelf: 'center',
  },
});

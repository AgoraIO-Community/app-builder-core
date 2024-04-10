import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  ModalProps,
  ViewStyle,
} from 'react-native';
import React, {SetStateAction} from 'react';
import IconButton from '../../atoms/IconButton';
import ThemeConfig from '../../theme';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {isMobileUA, useIsDesktop} from '../../utils/common';

interface RecordingsModalProps extends ModalProps {
  title?: string;
  subtitle?: string;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  showCloseIcon?: boolean;
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  cancelable?: boolean;
}
const RecordingsModal = (props: RecordingsModalProps) => {
  const {
    title,
    modalVisible,
    setModalVisible,
    children,
    cancelable = false,
  } = props;

  const isDesktop = useIsDesktop()('popup');

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}>
      <View style={[styles.centeredView, isDesktop && {alignItems: 'center'}]}>
        <TouchableWithoutFeedback
          onPress={() => {
            cancelable && setModalVisible(false);
          }}>
          <View style={styles.backDrop} />
        </TouchableWithoutFeedback>
        <View style={[styles.modalView, props?.contentContainerStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
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
                onPress={() => {
                  setModalVisible(false);
                }}
              />
            </View>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default RecordingsModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    maxWidth: 650,
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

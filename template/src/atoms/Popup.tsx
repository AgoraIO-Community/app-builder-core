import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  ModalProps,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import React, {SetStateAction} from 'react';
import IconButton from './IconButton';
import ThemeConfig from '../theme';

interface PopupProps extends ModalProps {
  title?: string;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  showCloseIcon?: boolean;
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
}
const Popup = (props: PopupProps) => {
  const {
    title,
    modalVisible,
    setModalVisible,
    children,
    showCloseIcon,
    ...otherProps
  } = props;
  const {height, width} = useWindowDimensions();
  const isDesktop = width > 675;
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
      {...otherProps}>
      <View style={[styles.centeredView, isDesktop && {alignItems: 'center'}]}>
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(false);
          }}>
          <View style={styles.backDrop} />
        </TouchableWithoutFeedback>

        <View style={[styles.modalView, props?.contentContainerStyle]}>
          {title || showCloseIcon ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {showCloseIcon ? (
                <IconButton
                  iconProps={{
                    name: 'close-rounded',
                    tintColor: $config.SECONDARY_ACTION_COLOR,
                  }}
                  onPress={() => {
                    setModalVisible(false);
                  }}
                />
              ) : (
                <></>
              )}
            </View>
          ) : (
            <></>
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
};

export default Popup;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    //alignItems: 'center',
  },
  modalView: {
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    borderRadius: 8,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 650,
  },
  backDrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: $config.HARD_CODED_BLACK_COLOR + '60',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '600',
  },
});

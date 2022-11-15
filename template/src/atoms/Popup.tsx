import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableWithoutFeedback,
  ModalProps,
} from 'react-native';
import React, {SetStateAction} from 'react';
import {BtnTemplate} from '../../agora-rn-uikit';

interface PopupProps extends ModalProps {
  title?: string;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  showCloseIcon?: boolean;
  children: React.ReactNode;
}
const Popup = (props: PopupProps) => {
  const {title, modalVisible, setModalVisible, children, ...otherProps} = props;
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
      {...otherProps}>
      <View style={styles.centeredView}>
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(false);
          }}>
          <View style={styles.backDrop} />
        </TouchableWithoutFeedback>

        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <BtnTemplate
              style={styles.closeIcon}
              name={'closeRounded'}
              onPress={() => {
                setModalVisible(false);
              }}
            />
          </View>
          <View>{children}</View>
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
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#fff',
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
    backgroundColor: '#0C0C0C',
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    color: '#181818',
    fontFamily: 'Source Sans Pro',
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '600',
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
});

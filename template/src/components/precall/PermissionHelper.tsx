import React, {SetStateAction, useContext} from 'react';
import {
  View,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
//@ts-ignore
import permissionHelperSvg from '../../assets/permission-helper.svg';
import StorageContext from '../StorageContext';

interface PermissionHelperProps {
  isVisible: boolean;
  setIsVisible: React.Dispatch<SetStateAction<boolean>>;
}

const PermissionHelper = (props: PermissionHelperProps) => {
  const {setStore} = useContext(StorageContext);
  const setSeenValue = () => {
    setStore((prevState) => {
      return {
        ...prevState,
        permissionPopupSeen: JSON.stringify(true),
      };
    });
  };

  return (
    <View>
      <Modal
        animationType="none"
        transparent={true}
        visible={props.isVisible}
        onRequestClose={() => {
          props.setIsVisible(false);
        }}>
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={() => {
            props.setIsVisible(false);
            setSeenValue();
          }}>
          <TouchableOpacity activeOpacity={1} style={styles.modal}>
            <View style={styles.modalImageContainer}>
              <Image
                style={styles.modalImage}
                resizeMode={'contain'}
                source={{uri: permissionHelperSvg}}
              />
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.infoMessage1}>
                Allow access to camera and microphone
              </Text>
              <Text style={styles.infoMessage2}>
                Select
                <Text style={styles.infoMessage2Highlight}> “Allow” </Text>for
                others to see and hear you
              </Text>
              <TouchableOpacity
                onPress={() => {
                  props.setIsVisible(false);
                  setSeenValue();
                }}>
                <Text style={styles.dismissBtn}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dismissBtn: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 20,
    color: '#099DFD',
    paddingVertical: 32,
  },
  infoMessage1: {
    paddingHorizontal: 76,
    paddingTop: 32,
    paddingBottom: 12,
    fontFamily: 'Source Sans Pro',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 25,
    textAlign: 'center',
    color: '#040405',
  },
  infoMessage2: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: '#2B2C33',
  },
  infoMessage2Highlight: {
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modal: {
    flex: 1,
    flexDirection: 'column',
    maxHeight: 386,
    width: 441,
    borderRadius: 20,
  },
  modalImageContainer: {
    minHeight: 190,
  },
  modalImage: {width: '100%', height: '100%'},
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});
export default PermissionHelper;

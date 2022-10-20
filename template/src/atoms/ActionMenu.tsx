import {
  Modal,
  StyleSheet,
  Text,
  ModalProps,
  TouchableWithoutFeedback,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {SetStateAction} from 'react';
import icons from '../assets/icons';
import {ImageIcon} from '../../agora-rn-uikit';

interface ActionMenuProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: React.Dispatch<SetStateAction<boolean>>;
  modalPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  items: {
    icon: string;
    title: string;
    callback: () => void;
  }[];
}

const ActionMenu = (props: ActionMenuProps) => {
  const {actionMenuVisible, setActionMenuVisible, modalPosition, items} = props;
  return (
    <View>
      {/* <Modal
        testID="action-menu"
        animationType="fade"
        transparent={true}
        visible={actionMenuVisible}>
        <TouchableWithoutFeedback
          onPress={() => {
            setActionMenuVisible(false);
          }}>
          <View style={styles.backDrop} />
        </TouchableWithoutFeedback>
      </Modal> */}
      {actionMenuVisible && (
        <View style={[styles.modalView, modalPosition]}>
          {items.map(({icon, title, callback}) => (
            <TouchableOpacity style={styles.row} onPress={callback}>
              <View style={styles.iconContainer}>
                <ImageIcon
                  style={styles.icon}
                  icon={icons[icon]}
                  color={icon === 'cancel' ? '#FF414D' : '#1a1a1a'}
                />
              </View>
              <Text
                style={[
                  styles.text,
                  {color: icon === 'cancel' ? '#FF414D' : '#1a1a1a'},
                ]}>
                {title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default ActionMenu;

const styles = StyleSheet.create({
  modalView: {
    position: 'absolute',
    maxWidth: 220,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    zIndex: 1,
    elevation: 1,
  },
  row: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
    flexDirection: 'row',
  },

  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  icon: {
    width: 16,
    height: 16,
  },
  text: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
  },

  backDrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

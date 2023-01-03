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
import React, {SetStateAction, useState} from 'react';

import ImageIcon from '../atoms/ImageIcon';
import {IconsInterface} from '../atoms/CustomIcon';
import ThemeConfig from '../theme';
import {isWeb} from '../utils/common';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';

export interface ActionMenuItem {
  icon: keyof IconsInterface;
  onHoverIcon?: keyof IconsInterface;
  iconColor: string;
  textColor: string;
  title: string;
  callback: () => void;
}
export interface ActionMenuProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: React.Dispatch<SetStateAction<boolean>>;
  modalPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  items: ActionMenuItem[];
}

const ActionMenu = (props: ActionMenuProps) => {
  const {actionMenuVisible, setActionMenuVisible, modalPosition, items} = props;
  return (
    <View>
      <Modal
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
        <View style={[styles.modalView, modalPosition]}>
          {items.map(
            (
              {icon, onHoverIcon, title, callback, iconColor, textColor},
              index,
            ) => (
              <PlatformWrapper>
                {(isHovered: boolean) => (
                  <TouchableOpacity
                    style={[styles.row, isHovered ? styles.rowHovered : {}]}
                    onPress={callback}
                    key={icon + index}>
                    <View style={styles.iconContainer}>
                      <ImageIcon
                        iconType="plain"
                        iconSize={20}
                        name={isHovered && onHoverIcon ? onHoverIcon : icon}
                        tintColor={iconColor}
                      />
                    </View>
                    <Text
                      style={[
                        styles.text,
                        textColor ? {color: textColor} : {},
                      ]}>
                      {title}
                    </Text>
                  </TouchableOpacity>
                )}
              </PlatformWrapper>
            ),
          )}
        </View>
      </Modal>
    </View>
  );
};

const PlatformWrapper = ({children}) => {
  const [isHovered, setIsHovered] = useState(false);
  return isWeb() ? (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}>
      {children(isHovered)}
    </div>
  ) : (
    <>{children(false)}</>
  );
};

export default ActionMenu;

const styles = StyleSheet.create({
  modalView: {
    position: 'absolute',
    width: 220,
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 1,
    elevation: 1,
  },
  rowHovered: {
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['15%'],
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: $config.CARD_LAYER_3_COLOR,
    flexDirection: 'row',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginVertical: 12,
    marginLeft: 12,
  },
  text: {
    paddingVertical: 14,
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '400',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  backDrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

import {
  Modal,
  StyleSheet,
  Text,
  ModalProps,
  TouchableWithoutFeedback,
  View,
  Image,
  TouchableOpacity,
  ViewStyle,
  useWindowDimensions,
  StyleProp,
  TextStyle,
  Pressable,
} from 'react-native';
import React, {SetStateAction, useState} from 'react';

import ImageIcon from '../atoms/ImageIcon';
import {IconsInterface} from '../atoms/CustomIcon';
import ThemeConfig from '../theme';
import {isWebInternal} from '../utils/common';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import Toggle from './Toggle';
import {ToolbarItemHide} from './ToolbarPreset';
import {UidType} from '../../agora-rn-uikit';
import {useRoomInfo} from 'customization-api';

export interface ActionMenuItem {
  key?: string;
  component?: React.ComponentType<any>;
  componentName?: string;
  order?: number;
  isExternalIcon?: boolean;
  externalIconString?: string;
  isBase64Icon?: boolean;
  icon?: keyof IconsInterface;
  onHoverIcon?: keyof IconsInterface;
  iconColor?: string;
  textColor?: string;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  label?: string;
  toggleStatus?: boolean;
  onPress?: () => void;
  onHoverCallback?: (isHovered: boolean) => void;
  closeActionMenu?: () => void;
  uid?: UidType;
  onHoverContent?: JSX.Element;
  disabled?: boolean;
  iconSize?: number;
  hide?: ToolbarItemHide;
  type?: string;
}
export interface ActionMenuProps {
  from: string;
  actionMenuVisible: boolean;
  setActionMenuVisible: React.Dispatch<SetStateAction<boolean>>;
  modalPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  items: ActionMenuItem[];
  hoverMode?: boolean;
  onHover?: (hover: boolean) => void;
  containerStyle?: ViewStyle;
}

export interface UserActionMenuItemProps {
  label: string;
  icon?: keyof IconsInterface;
  onHoverIcon?: keyof IconsInterface;
  toggleStatus?: boolean;
  iconColor: string;
  textColor: string;
  onPress?: () => void;
  onToggle?: () => void;
  disabled?: boolean;
  iconSize?: number;
  isHovered?: boolean;
  isExternalIcon?: boolean;
  isBase64Icon?: boolean;
  externalIconString?: string;
  titleStyle?: StyleProp<TextStyle>;
}

export const UserActionMenuItem = ({
  label,
  icon,
  toggleStatus,
  onPress,
  onToggle,
  iconColor,
  textColor,
  iconSize = 20,
  titleStyle = {},
  disabled = false,
  isHovered = false,
  onHoverIcon,
  isExternalIcon = false,
  isBase64Icon = false,
  externalIconString = '',
}: UserActionMenuItemProps) => {
  const iconToShow = isHovered && onHoverIcon && !disabled ? onHoverIcon : icon;

  const content = (
    <>
      <View style={styles.iconContainer}>
        {isExternalIcon ? (
          <ImageIcon
            base64={isBase64Icon}
            base64TintColor={iconColor}
            iconType="plain"
            iconSize={iconSize}
            icon={externalIconString}
            tintColor={iconColor}
          />
        ) : (
          <ImageIcon
            base64={isBase64Icon}
            base64TintColor={iconColor}
            iconType="plain"
            iconSize={iconSize}
            name={iconToShow}
            tintColor={iconColor}
          />
        )}
      </View>
      <Text style={[styles.text, titleStyle, {color: textColor}]}>{label}</Text>

      {typeof toggleStatus === 'boolean' && (
        <View style={styles.toggleContainer}>
          <Toggle
            disabled={disabled}
            isEnabled={toggleStatus}
            toggleSwitch={onToggle ?? onPress}
          />
        </View>
      )}
    </>
  );

  const shouldWrapInPressable =
    typeof toggleStatus !== 'boolean' && typeof onPress === 'function';
  return shouldWrapInPressable ? (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{flexDirection: 'row'}}>
      {content}
    </Pressable>
  ) : (
    <>{content}</>
  );
};

const ActionMenu = (props: ActionMenuProps) => {
  const {
    actionMenuVisible,
    setActionMenuVisible,
    modalPosition,
    items,
    hoverMode = false,
  } = props;
  const {width, height} = useWindowDimensions();
  const {
    data: {roomId},
  } = useRoomInfo();

  const renderItems = () => {
    return items?.map((item, index) => {
      const {hide = false} = item;
      if (typeof hide === 'boolean' && hide) {
        return null;
      }

      try {
        if (typeof hide === 'function' && hide && hide(width, height)) {
          return null;
        }
      } catch (error) {}

      const {
        title,
        label = null,
        component: CustomActionItem = null,
        icon = '',
        onHoverIcon,
        isBase64Icon = false,
        isExternalIcon = false,
        externalIconString = '',
        toggleStatus,
        onPress = () => {},
        closeActionMenu = () => {},
        uid,
        iconColor,
        textColor,
        disabled = false,
        onHoverCallback = undefined,
        onHoverContent = undefined,
        iconSize = 20,
        titleStyle = {},
        type = '',
      } = item;
      return (
        <PlatformWrapper key={props.from + '_' + title + index}>
          {(isHovered: boolean) => (
            <>
              {/* {onHoverCallback && onHoverCallback(isHovered)} */}
              {isHovered ? onHoverContent ? onHoverContent : <></> : <></>}
              {CustomActionItem ? (
                <TouchableOpacity
                  disabled={disabled}
                  onPress={onPress}
                  style={[
                    styles.row,
                    isHovered && !disabled
                      ? //first item should have border-radius on top left and top right
                        index === 0
                        ? styles.rowHoveredFirstChild
                        : //last item should have border-radius on bottom left and top right
                        items?.length - 1 === index
                        ? styles.rowHoveredLastChild
                        : //middle items don't need any border-radius
                          styles.rowHoveredMiddleItems
                      : {},
                    disabled ? {opacity: 0.4} : {},
                    items?.length - 1 === index
                      ? {borderBottomColor: 'transparent'}
                      : {},
                  ]}>
                  <CustomActionItem
                    closeActionMenu={closeActionMenu}
                    targetUid={uid}
                    hostMeetingId={roomId?.host}
                    targetUidType={type}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  disabled={disabled}
                  style={[
                    styles.row,
                    isHovered && !disabled
                      ? //first item should have border-radius on top left and top right
                        index === 0
                        ? styles.rowHoveredFirstChild
                        : //last item should have border-radius on bottom left and top right
                        items?.length - 1 === index
                        ? styles.rowHoveredLastChild
                        : //middle items don't need any border-radius
                          styles.rowHoveredMiddleItems
                      : {},
                    disabled ? {opacity: 0.4} : {},
                    items?.length - 1 === index
                      ? {borderBottomColor: 'transparent'}
                      : {},
                  ]}
                  onPress={onPress}
                  key={icon + index}>
                  <UserActionMenuItem
                    label={label || title}
                    icon={icon}
                    toggleStatus={toggleStatus}
                    iconColor={iconColor}
                    textColor={textColor}
                    iconSize={iconSize}
                    titleStyle={titleStyle}
                    disabled={disabled}
                    onToggle={onPress}
                    isHovered={isHovered}
                    isExternalIcon={isExternalIcon}
                    externalIconString={externalIconString}
                    isBase64Icon={isBase64Icon}
                    onHoverIcon={onHoverIcon}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </PlatformWrapper>
      );
    });
  };

  return (
    <View>
      {hoverMode ? (
        actionMenuVisible && (
          <View
            style={[styles.modalView, props?.containerStyle, modalPosition]}>
            <div
              onMouseEnter={() => props?.onHover && props.onHover(true)}
              onMouseLeave={() => props?.onHover && props.onHover(false)}>
              {renderItems()}
            </div>
          </View>
        )
      ) : (
        <Modal
          testID="action-menu"
          animationType="none"
          transparent={true}
          visible={actionMenuVisible}>
          <TouchableWithoutFeedback
            onPress={() => {
              setActionMenuVisible(false);
            }}>
            <View style={styles.backDrop} />
          </TouchableWithoutFeedback>
          <View
            style={[styles.modalView, props?.containerStyle, modalPosition]}>
            {renderItems()}
          </View>
        </Modal>
      )}
    </View>
  );
};

const PlatformWrapper = ({children}) => {
  const [isHovered, setIsHovered] = useState(false);
  return isWebInternal() ? (
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
    //don't added overflow: hidden, bottombar minimized version layout popup will be shown in the overflow
    position: 'absolute',
    // width: 230,
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
    minWidth: 180,
  },
  rowHoveredMiddleItems: {
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['15%'],
  },
  rowHoveredFirstChild: {
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['15%'],
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  rowHoveredLastChild: {
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['15%'],
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: $config.CARD_LAYER_3_COLOR,
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginVertical: 12,
    marginLeft: 12,
  },
  toggleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 'auto',
  },
  text: {
    paddingVertical: 14,
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '400',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    marginRight: 8,
  },
  backDrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

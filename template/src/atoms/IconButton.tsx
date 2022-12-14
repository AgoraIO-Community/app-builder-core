import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import ImageIcon, {ImageIconProps} from './ImageIcon';
import {isWeb} from '../utils/common';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import ToolTip from './Tooltip';

export interface IconButtonProps {
  onPress?: TouchableOpacityProps['onPress'];
  style?: ViewStyle;
  activeStyle?: ViewStyle;
  styleText?: TextStyle;
  btnTextColor?: string;
  btnText?: string;
  disabled?: boolean;
  iconProps?: ImageIconProps;
  customIconComponent?: any;
  toolTipMessage?: string;
  isToolTipVisible?: boolean;
  setToolTipVisible?: React.Dispatch<React.SetStateAction<boolean>>;
}

const IconButton = (props: IconButtonProps) => {
  return (
    <TouchableOpacity
      style={props?.isToolTipVisible ? props?.activeStyle : props?.style}
      onPress={props.onPress}
      disabled={props.disabled}>
      {props?.customIconComponent ? (
        props.customIconComponent
      ) : (
        <ImageIcon {...props.iconProps} />
      )}
      {props?.btnText ? (
        <Text
          style={[
            {
              textAlign: 'center',
              marginTop: 5,
            },
            props?.btnTextColor ? {color: props.btnTextColor} : {},
            props?.styleText,
          ]}>
          {props.btnText}
        </Text>
      ) : (
        <></>
      )}
    </TouchableOpacity>
  );
};

// const PlatformWrapper = ({children, ...props}) => {
//   const [isHovered, setIsHovered] = React.useState(false);
//   return isWeb() ? (
//     <div
//       style={{
//         backgroundColor: isHovered
//           ? $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['10%']
//           : 'transparent',
//         cursor: isHovered ? 'pointer' : 'auto',
//         paddingLeft: 20,
//         paddingRight: 20,
//         paddingTop: 8,
//         paddingBottom: 8,
//         borderRadius: 8,
//       }}
//       onMouseEnter={() => {
//         setIsHovered(true);
//       }}
//       onMouseLeave={() => {
//         setIsHovered(false);
//       }}
//       onClick={(e) => {
//         e.preventDefault();
//         props?.disabled ? () => {} : props?.onPress && props.onPress();
//       }}>
//       {children}
//     </div>
//   ) : (
//     <TouchableOpacity {...props}>{children}</TouchableOpacity>
//   );
// };

const IconButtonWithToolTip = (props: IconButtonProps) => {
  if (props?.toolTipMessage) {
    return (
      <ToolTip
        toolTipMessage={props.toolTipMessage}
        renderContent={(isToolTipVisible, setToolTipVisible) => {
          return (
            <IconButton
              activeStyle={styles.activeBgStyle}
              style={styles.defaultBgStyle}
              {...props}
              isToolTipVisible={isToolTipVisible}
              setToolTipVisible={setToolTipVisible}
            />
          );
        }}></ToolTip>
    );
  }
  return <IconButton {...props} />;
};

export default IconButtonWithToolTip;

const styles = StyleSheet.create({
  activeBgStyle: {
    backgroundColor:
      $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['10%'],
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 8,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultBgStyle: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 8,
    paddingBottom: 8,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

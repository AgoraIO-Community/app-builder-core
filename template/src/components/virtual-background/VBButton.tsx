import React from 'react';
import ToolbarMenuItem from '../../atoms/ToolbarMenuItem';
import {useToolbarMenu} from '../../utils/useMenu';
import IconButton, {IconButtonProps} from '../../atoms/IconButton';
import {useActionSheet} from '../../utils/useActionSheet';
import {useString} from '../../utils/useString';
import {toolbarItemVirtualBackgroundText} from '../../language/default-labels/videoCallScreenLabels';
import {useToolbarProps} from '../../atoms/ToolbarItem';

interface VBButtonProps {
  isVBOpen: boolean;
  setIsVBOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showLabel?: boolean;
  render?: (onPress: () => void) => JSX.Element;
}

const VBButton = (props: VBButtonProps) => {
  const {label = null, onPress: onPressCustom = null} = useToolbarProps();
  const {setIsVBOpen, showLabel = false} = props;
  const {isToolbarMenuItem} = useToolbarMenu();
  const {isOnActionSheet} = useActionSheet();
  const vbLabel = useString(toolbarItemVirtualBackgroundText)();

  const onPress = () => {
    setIsVBOpen(prev => !prev);
  };

  let iconButtonProps: IconButtonProps = {
    onPress: onPressCustom || onPress,
    iconProps: {
      tintColor: $config.SECONDARY_ACTION_COLOR,
      name: 'vb',
    },

    btnTextProps: {
      text: showLabel ? label || vbLabel?.replace(' ', '\n') : '',
      numberOfLines: 2,
      textStyle: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '400',
        fontFamily: 'Source Sans Pro',
        textAlign: 'center',
        color: $config.FONT_COLOR,
      },
    },
  };
  iconButtonProps.isOnActionSheet = isOnActionSheet;
  return props?.render ? (
    props.render(onPress)
  ) : (
    <>
      {isToolbarMenuItem ? (
        <ToolbarMenuItem {...iconButtonProps} />
      ) : (
        <IconButton {...iconButtonProps} />
      )}
    </>
  );
};

export default VBButton;

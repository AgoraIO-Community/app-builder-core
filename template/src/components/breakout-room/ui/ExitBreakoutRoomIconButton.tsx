/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/

import React from 'react';
import IconButton, {IconButtonProps} from '../../../atoms/IconButton';
import {useToolbarMenu} from '../../../utils/useMenu';
import ToolbarMenuItem from '../../../atoms/ToolbarMenuItem';
import {useToolbarProps} from '../../../atoms/ToolbarItem';
import {useActionSheet} from '../../../utils/useActionSheet';
import {useBreakoutRoom} from '../context/BreakoutRoomContext';

export interface ScreenshareButtonProps {
  render?: (onPress: () => void) => JSX.Element;
}

const ExitBreakoutRoomIconButton = (props: ScreenshareButtonProps) => {
  const {label = null, onPress: onPressCustom = null} = useToolbarProps();
  const {isOnActionSheet, showLabel} = useActionSheet();
  const {exitBreakoutRoom} = useBreakoutRoom();
  const {isToolbarMenuItem} = useToolbarMenu();

  const onPress = () => {
    exitBreakoutRoom();
  };

  let iconButtonProps: IconButtonProps = {
    onPress: onPressCustom || onPress,
    iconProps: {
      name: 'close-room',
      tintColor: $config.SECONDARY_ACTION_COLOR,
    },
    btnTextProps: {
      textColor: $config.FONT_COLOR,
      text: showLabel ? label || 'Exit Room' : '',
    },
  };

  if (isOnActionSheet) {
    iconButtonProps.btnTextProps.textStyle = {
      color: $config.FONT_COLOR,
      marginTop: 8,
      fontSize: 12,
      fontWeight: '400',
      fontFamily: 'Source Sans Pro',
      textAlign: 'center',
    };
  }
  iconButtonProps.isOnActionSheet = isOnActionSheet;

  return props?.render ? (
    props.render(onPress)
  ) : isToolbarMenuItem ? (
    <ToolbarMenuItem {...iconButtonProps} />
  ) : (
    <IconButton {...iconButtonProps} />
  );
};

export default ExitBreakoutRoomIconButton;

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
import TertiaryButton from '../atoms/TertiaryButton';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import {useVideoCall} from '../components/useVideoCall';
import {useToolbarMenu} from '../utils/useMenu';
import ToolbarMenuItem from '../atoms/ToolbarMenuItem';
import {useActionSheet} from '../utils/useActionSheet';
import {useString} from '../utils/useString';
import {toolbarItemInviteText} from '../language/default-labels/videoCallScreenLabels';
import {useToolbarProps} from '../atoms/ToolbarItem';

export interface CopyJoinInfoProps {
  showTeritaryButton?: boolean;
  render?: (onPress: () => void) => JSX.Element;
}

const CopyJoinInfo = (props: CopyJoinInfoProps) => {
  const {label = null, onPress: onPressCustom = null} = useToolbarProps();
  const {isOnActionSheet, showLabel} = useActionSheet();
  const {isToolbarMenuItem} = useToolbarMenu();

  const {showTeritaryButton = false} = props;
  const copyMeetingInviteButton = useString(toolbarItemInviteText)();
  const {setShowInvitePopup} = useVideoCall();

  const onPress = () => {
    setShowInvitePopup(true);
  };
  let iconButtonProps: IconButtonProps = {
    onPress: onPressCustom || onPress,
    iconProps: {
      name: 'share',
      tintColor: $config.SECONDARY_ACTION_COLOR,
    },
    btnTextProps: {
      textColor: $config.FONT_COLOR,
      text: showLabel ? label || copyMeetingInviteButton : '',
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
  ) : (
    <>
      {showTeritaryButton ? (
        <TertiaryButton text={copyMeetingInviteButton} onPress={onPress} />
      ) : isToolbarMenuItem ? (
        <ToolbarMenuItem {...iconButtonProps} />
      ) : (
        <IconButton {...iconButtonProps} />
      )}
    </>
  );
};

export default CopyJoinInfo;

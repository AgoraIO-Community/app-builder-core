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
import React, {useContext} from 'react';
import ThemeConfig from '../../theme';
import IconButton, {IconButtonProps} from '../../atoms/IconButton';
import Styles from '../../components/styles';
import {useString} from '../../utils/useString';
import {useScreenshare} from './useScreenshare';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {PropsContext, ClientRole} from '../../../agora-rn-uikit';
import {useLocalUserInfo, useRoomInfo} from 'customization-api';
import useIsHandRaised from '../../utils/useIsHandRaised';
import {useToolbarMenu} from '../../utils/useMenu';
import ToolbarMenuItem from '../../atoms/ToolbarMenuItem';
/**
 * A component to start and stop screen sharing on web clients.
 * Screen sharing is not yet implemented on mobile platforms.
 * Electron has it's own screen sharing component
 */

export interface ScreenshareButtonProps {
  render?: (onPress: () => void, isScreenshareActive: boolean) => JSX.Element;
}

const ScreenshareButton = (props: ScreenshareButtonProps) => {
  const {isToolbarMenuItem} = useToolbarMenu();
  const {rtcProps} = useContext(PropsContext);
  const {
    data: {isHost},
  } = useRoomInfo();
  const local = useLocalUserInfo();
  const isHandRaised = useIsHandRaised();
  const {isScreenshareActive, startUserScreenshare, stopUserScreenShare} =
    useScreenshare();
  //commented for v1 release
  //const screenShareButton = useString('screenShareButton')();

  const onPress = () =>
    isScreenshareActive ? stopUserScreenShare() : startUserScreenshare();
  const screenShareButton = isScreenshareActive ? 'Stop Share' : 'Share';
  let iconButtonProps: IconButtonProps = {
    iconProps: {
      name: isScreenshareActive ? 'stop-screen-share' : 'screen-share',
      tintColor: isScreenshareActive
        ? $config.SEMANTIC_ERROR
        : $config.SECONDARY_ACTION_COLOR,
    },
    onPress,
    btnTextProps: {
      text: $config.ICON_TEXT ? screenShareButton : '',
      textColor: $config.FONT_COLOR,
    },
  };

  if (
    rtcProps.role == ClientRole.Audience &&
    $config.EVENT_MODE &&
    !$config.RAISE_HAND
  ) {
    return null;
  }

  if (
    rtcProps.role == ClientRole.Audience &&
    $config.EVENT_MODE &&
    $config.RAISE_HAND &&
    !isHost
  ) {
    iconButtonProps.iconProps = {
      ...iconButtonProps.iconProps,
      tintColor: $config.SEMANTIC_NEUTRAL,
    };
    iconButtonProps.toolTipMessage = isHandRaised(local.uid)
      ? 'Waiting for host to appove the request'
      : 'Raise Hand in order to present';
    iconButtonProps.disabled = true;
  }

  return props?.render ? (
    props.render(onPress, isScreenshareActive)
  ) : isToolbarMenuItem ? (
    <ToolbarMenuItem {...iconButtonProps} />
  ) : (
    <IconButton {...iconButtonProps} />
  );
};

export default ScreenshareButton;

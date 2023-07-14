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
import {useLocalUserInfo, useMeetingInfo} from 'customization-api';
import useIsHandRaised from '../../utils/useIsHandRaised';
import {isAndroid, isIOS} from '../../utils/common';
import {useVideoCall} from '../../components/useVideoCall';
/**
 * A component to start and stop screen sharing on web clients.
 * Screen sharing is not yet implemented on mobile platforms.
 * Electron has it's own screen sharing component
 */

export interface ScreenshareButtonProps {
  render?: (onPress: () => void, isScreenshareActive: boolean) => JSX.Element;
  showLabel?: boolean;
  isOnActionSheet?: boolean;
}

const ScreenshareButton = (props: ScreenshareButtonProps) => {
  const {rtcProps} = useContext(PropsContext);
  const {showLabel = $config.ICON_TEXT || false, isOnActionSheet = false} =
    props;
  const {
    data: {isHost},
  } = useMeetingInfo();
  const local = useLocalUserInfo();
  const isHandRaised = useIsHandRaised();
  const {isScreenshareActive, startUserScreenshare, stopUserScreenShare} =
    useScreenshare();
  const {setShowStartScreenSharePopup} = useVideoCall();
  //commented for v1 release
  //const screenShareButton = useString('screenShareButton')();

  const onPress = () => {
    if (isScreenshareActive) {
      stopUserScreenShare();
    } else {
      if (isAndroid() || isIOS()) {
        //native screen we need to stop user video before proceeding the screenshare
        //so showing confirm popup to stop camera(if cam on ) and option to share audio
        setShowStartScreenSharePopup(true);
      } else {
        startUserScreenshare();
      }
    }
  };

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
      text: showLabel ? screenShareButton : '',
      textColor: $config.FONT_COLOR,
    },
  };
  iconButtonProps.isOnActionSheet = isOnActionSheet;
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
  ) : (
    <IconButton {...iconButtonProps} />
  );
};

export default ScreenshareButton;

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
import {
  ToggleState,
  PermissionState,
  ImageIcon as UIKitImageIcon,
  ClientRole,
  PropsContext,
} from '../../agora-rn-uikit';
import useMuteToggleLocal, {MUTE_LOCAL_TYPE} from '../utils/useMuteToggleLocal';
import Styles from '../components/styles';
import {useString} from '../utils/useString';
import {useLocalUserInfo, useMeetingInfo} from 'customization-api';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import ThemeConfig from '../theme';
import {ImageIconProps} from '../atoms/ImageIcon';
import useIsHandRaised from '../utils/useIsHandRaised';
/**
 * A component to mute / unmute the local video
 */
export interface LocalVideoMuteProps {
  showLabel?: boolean;
  render?: (onPress: () => void, isVideoEnabled: boolean) => JSX.Element;
  disabled?: boolean;
  isOnActionSheet?: boolean;
  iconProps?: (
    isVideoEnabled: boolean,
    isPermissionDenied: boolean,
  ) => Partial<ImageIconProps>;
  showWarningIcon?: boolean;
}

function LocalVideoMute(props: LocalVideoMuteProps) {
  const {rtcProps} = useContext(PropsContext);
  const {
    data: {isHost},
  } = useMeetingInfo();
  const local = useLocalUserInfo();
  const isHandRaised = useIsHandRaised();
  const localMute = useMuteToggleLocal();
  const {
    showLabel = $config.ICON_TEXT,
    disabled = false,
    isOnActionSheet = false,
    showWarningIcon = true,
  } = props;
  //commented for v1 release
  //const videoLabel = useString('toggleVideoButton')();

  const onPress = () => {
    localMute(MUTE_LOCAL_TYPE.video);
  };
  const isVideoEnabled = local.video === ToggleState.enabled;

  const permissionDenied =
    local.permissionStatus === PermissionState.REJECTED ||
    local.permissionStatus === PermissionState.GRANTED_FOR_MIC_ONLY;

  const videoLabel = permissionDenied
    ? 'Video'
    : isVideoEnabled
    ? 'Video On'
    : 'Video Off';

  let iconProps: IconButtonProps['iconProps'] = {
    showWarningIcon: permissionDenied && showWarningIcon ? true : false,
    name: isVideoEnabled ? 'video-on' : 'video-off',
    iconBackgroundColor: isVideoEnabled
      ? $config.PRIMARY_ACTION_BRAND_COLOR
      : '',
    tintColor: isVideoEnabled
      ? $config.PRIMARY_ACTION_TEXT_COLOR
      : disabled
      ? $config.SEMANTIC_NETRUAL
      : permissionDenied
      ? $config.SEMANTIC_NETRUAL
      : $config.SEMANTIC_ERROR,
    ...(props?.iconProps
      ? props.iconProps(isVideoEnabled, permissionDenied)
      : {}),
  };

  let iconButtonProps: IconButtonProps = {
    onPress,
    iconProps,
    btnTextProps: {
      text: showLabel ? videoLabel : '',
      textColor: $config.FONT_COLOR,
    },
    disabled: permissionDenied || disabled ? true : false,
  };

  iconButtonProps.isOnActionSheet = isOnActionSheet;

  iconButtonProps.toolTipMessage = showLabel
    ? permissionDenied
      ? 'Give Permissions'
      : isVideoEnabled
      ? 'Disable Camera'
      : 'Enable Camera'
    : '';
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
      name: 'video-off',
      tintColor: $config.SEMANTIC_NETRUAL,
    };
    iconButtonProps.toolTipMessage = isHandRaised(local.uid)
      ? 'Waiting for host to appove the request'
      : 'Raise Hand in order to turn video on';
    iconButtonProps.disabled = true;
  }
  return props?.render ? (
    props.render(onPress, isVideoEnabled)
  ) : (
    <IconButton {...iconButtonProps} />
  );
}

export default LocalVideoMute;

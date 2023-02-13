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
  useLocalUid,
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
 * A component to mute / unmute the local audio
 */
export interface LocalAudioMuteProps {
  plainIconHoverEffect?: boolean;
  showToolTip?: boolean;
  showLabel?: boolean;
  iconProps?: (
    isAudioEnabled: boolean,
    isPermissionDenied: boolean,
  ) => Partial<ImageIconProps>;
  render?: (onPress: () => void, isAudioEnabled: boolean) => JSX.Element;
  disabled?: boolean;
  isOnActionSheet?: boolean;
  showWarningIcon?: boolean;
  isMobileView?: boolean;
}

function LocalAudioMute(props: LocalAudioMuteProps) {
  const {rtcProps} = useContext(PropsContext);
  const {
    data: {isHost},
  } = useMeetingInfo();
  const local = useLocalUserInfo();
  const isHandRaised = useIsHandRaised();
  const localMute = useMuteToggleLocal();
  const {
    showToolTip = false,
    showLabel = $config.ICON_TEXT,
    disabled = false,
    isOnActionSheet = false,
    showWarningIcon = true,
    isMobileView = false,
  } = props;
  //commented for v1 release
  //const audioLabel = useString('toggleAudioButton')();

  const onPress = () => {
    localMute(MUTE_LOCAL_TYPE.audio);
  };
  const isAudioEnabled = local.audio === ToggleState.enabled;

  const permissionDenied =
    local.permissionStatus === PermissionState.REJECTED ||
    local.permissionStatus === PermissionState.GRANTED_FOR_CAM_ONLY;

  const audioLabel = permissionDenied
    ? 'Mic'
    : isAudioEnabled
    ? 'Mic On'
    : 'Mic Off';

  let iconProps: IconButtonProps['iconProps'] = {
    showWarningIcon: permissionDenied && showWarningIcon ? true : false,
    name: isAudioEnabled ? 'mic-on' : 'mic-off',

    iconBackgroundColor: isAudioEnabled
      ? $config.PRIMARY_ACTION_BRAND_COLOR
      : '',
    tintColor: isAudioEnabled
      ? $config.PRIMARY_ACTION_TEXT_COLOR
      : disabled
      ? $config.SEMANTIC_NEUTRAL
      : permissionDenied
      ? $config.SEMANTIC_NEUTRAL
      : $config.SEMANTIC_ERROR,
    ...(props?.iconProps
      ? props.iconProps(isAudioEnabled, permissionDenied)
      : {}),
  };

  let iconButtonProps: IconButtonProps = {
    hoverEffect: !permissionDenied
      ? props?.plainIconHoverEffect
        ? true
        : false
      : false,
    hoverEffectStyle: props?.plainIconHoverEffect
      ? {backgroundColor: $config.ICON_BG_COLOR, borderRadius: 20}
      : {},
    onPress,
    iconProps,
    btnTextProps: {
      text: showLabel ? audioLabel : '',
      textColor: $config.FONT_COLOR,
    },
    disabled: permissionDenied || disabled ? true : false,
  };

  iconButtonProps.isOnActionSheet = isOnActionSheet;

  if (!isMobileView) {
    iconButtonProps.toolTipMessage = showToolTip
      ? permissionDenied
        ? 'Give Permissions'
        : isAudioEnabled
        ? 'Disable Mic'
        : 'Enable Mic'
      : '';
  }

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
      name: 'mic-off',
      tintColor: $config.SEMANTIC_NEUTRAL,
    };
    iconButtonProps.toolTipMessage = showToolTip
      ? isHandRaised(local.uid)
        ? 'Waiting for host to appove the request'
        : 'Raise Hand in order to turn mic on'
      : '';
    iconButtonProps.disabled = true;
  }

  return props?.render ? (
    props.render(onPress, isAudioEnabled)
  ) : (
    <IconButton {...iconButtonProps} />
  );
}

export default LocalAudioMute;

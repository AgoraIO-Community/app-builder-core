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
import {
  ToggleState,
  PermissionState,
  ImageIcon as UIKitImageIcon,
} from '../../agora-rn-uikit';
import useMuteToggleLocal, {MUTE_LOCAL_TYPE} from '../utils/useMuteToggleLocal';
import Styles from '../components/styles';
import {useString} from '../utils/useString';
import {useLocalUserInfo} from 'customization-api';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import ThemeConfig from '../theme';
import {ImageIconProps} from '../atoms/ImageIcon';
/**
 * A component to mute / unmute the local audio
 */
export interface LocalAudioMuteProps {
  showLabel?: boolean;
  iconProps?: (
    isAudioEnabled: boolean,
    isPermissionDenied: boolean,
  ) => Partial<ImageIconProps>;
  render?: (onPress: () => void, isAudioEnabled: boolean) => JSX.Element;
  disabled?: boolean;
  isOnActionSheet?: boolean;
}

function LocalAudioMute(props: LocalAudioMuteProps) {
  const local = useLocalUserInfo();
  const localMute = useMuteToggleLocal();
  const {
    showLabel = $config.ICON_TEXT,
    disabled = false,
    isOnActionSheet = false,
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
    name: permissionDenied ? 'no-mic' : isAudioEnabled ? 'mic-on' : 'mic-off',
    base64: permissionDenied ? true : false,
    iconBackgroundColor: isAudioEnabled
      ? $config.PRIMARY_ACTION_BRAND_COLOR
      : '',
    tintColor: isAudioEnabled
      ? $config.PRIMARY_ACTION_TEXT_COLOR
      : disabled
      ? $config.SEMANTIC_NETRUAL
      : $config.SEMANTIC_ERROR,
    ...(props?.iconProps
      ? props.iconProps(isAudioEnabled, permissionDenied)
      : {}),
  };

  let iconButtonProps: IconButtonProps = {
    onPress,
    iconProps,
    btnTextProps: {
      text: showLabel ? audioLabel : '',
      textColor: $config.FONT_COLOR,
    },
    disabled: permissionDenied || disabled ? true : false,
  };

  iconButtonProps.isOnActionSheet = isOnActionSheet;

  iconButtonProps.toolTipMessage = showLabel
    ? permissionDenied
      ? 'Give Permissions'
      : isAudioEnabled
      ? 'Disable Mic'
      : 'Enable Mic'
    : '';

  return props?.render ? (
    props.render(onPress, isAudioEnabled)
  ) : (
    <IconButton {...iconButtonProps} />
  );
}

export default LocalAudioMute;

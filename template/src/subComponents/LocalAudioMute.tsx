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
/**
 * A component to mute / unmute the local audio
 */
export interface LocalAudioMuteProps {
  showLabel?: boolean;
  iconSize?: IconButtonProps['iconProps']['iconSize'];
  render?: (onPress: () => void, isAudioEnabled: boolean) => JSX.Element;
  disabled?: boolean;
}

function LocalAudioMute(props: LocalAudioMuteProps) {
  const local = useLocalUserInfo();
  const localMute = useMuteToggleLocal();
  const {showLabel = $config.ICON_TEXT, disabled = false} = props;
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
  };
  if (props?.iconSize) {
    iconProps.iconSize = props.iconSize;
  }
  if (!permissionDenied) {
    iconProps.tintColor = isAudioEnabled
      ? $config.PRIMARY_ACTION_BRAND_COLOR
      : disabled
      ? $config.SEMANTIC_NETRUAL
      : $config.SEMANTIC_ERROR;
  } else {
    iconProps.tintColor = '#8F8F8F';
  }

  let iconButtonProps: IconButtonProps = {
    onPress,
    iconProps,
    disabled: permissionDenied || disabled ? true : false,
  };
  if (permissionDenied) {
    iconButtonProps.customIconComponent = (
      <UIKitImageIcon name="noMic" style={{width: 24, height: 24}} />
    );
  } else {
    iconButtonProps.customIconComponent = null;
  }
  iconButtonProps.styleText = {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
    color: permissionDenied
      ? '#8F8F8F'
      : isAudioEnabled
      ? $config.PRIMARY_ACTION_BRAND_COLOR
      : $config.SEMANTIC_ERROR,
  };

  iconButtonProps.btnText = showLabel ? audioLabel : '';
  iconButtonProps.toolTipMessage = permissionDenied
    ? 'Give Permissions'
    : isAudioEnabled
    ? 'Disable Mic'
    : 'Enable Mic';

  return props?.render ? (
    props.render(onPress, isAudioEnabled)
  ) : (
    <IconButton {...iconButtonProps} />
  );
}

export default LocalAudioMute;

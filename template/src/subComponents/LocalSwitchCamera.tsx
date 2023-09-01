import React, {useContext} from 'react';
import {useString} from '../utils/useString';
import {PropsContext, ToggleState} from '../../agora-rn-uikit';
import Styles from '../components/styles';
import {isAndroid, isIOS, useLocalUserInfo, useRtc} from 'customization-api';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import {useScreenshare} from './screenshare/useScreenshare';

export interface LocalSwitchCameraProps {
  showLabel?: boolean;
  render?: (onPress: () => void, isVideoEnabled: boolean) => JSX.Element;
  disabled?: boolean;
}

function LocalSwitchCamera(props: LocalSwitchCameraProps) {
  const {callbacks} = useContext(PropsContext);
  const {isScreenshareActive} = useScreenshare();
  const {RtcEngine} = useRtc();
  const local = useLocalUserInfo();
  const {showLabel = $config.ICON_TEXT, disabled = false} = props;
  //commented for v1 release
  //const switchCameraButtonText = useString('switchCameraButton')();
  const switchCameraButtonText = 'Switch';

  const onPress = () => {
    RtcEngine.switchCamera();
    callbacks?.SwitchCamera && callbacks.SwitchCamera();
  };
  const isNativeScreenShareActive =
    (isAndroid() || isIOS()) && isScreenshareActive;
  const isVideoEnabled = isNativeScreenShareActive
    ? false
    : local.video === ToggleState.enabled;
  let iconButtonProps: IconButtonProps = {
    iconProps: {
      name: 'switch-camera',
      tintColor:
        isVideoEnabled || !disabled
          ? $config.SECONDARY_ACTION_COLOR
          : $config.SEMANTIC_NEUTRAL,
    },
    disabled: !isVideoEnabled || disabled ? true : false,
    onPress: onPress,
  };

  return props?.render ? (
    props.render(onPress, isVideoEnabled)
  ) : (
    <IconButton {...iconButtonProps} />
  );
}

export default LocalSwitchCamera;

import React, {useContext} from 'react';
import {useString} from '../utils/useString';
import {PropsContext, ToggleState} from '../../agora-rn-uikit';
import Styles from '../components/styles';
import {useLocalUserInfo, useRtc} from 'customization-api';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import {useToolbarMenu} from '../utils/useMenu';
import ToolbarMenuItem from '../atoms/ToolbarMenuItem';

export interface LocalSwitchCameraProps {
  showLabel?: boolean;
  render?: (onPress: () => void, isVideoEnabled: boolean) => JSX.Element;
  disabled?: boolean;
}

function LocalSwitchCamera(props: LocalSwitchCameraProps) {
  const {isToolbarMenuItem} = useToolbarMenu();
  const {callbacks} = useContext(PropsContext);
  const {RtcEngineUnsafe} = useRtc();
  const local = useLocalUserInfo();
  const {showLabel = $config.ICON_TEXT, disabled = false} = props;
  //commented for v1 release
  //const switchCameraButtonText = useString('switchCameraButton')();
  const switchCameraButtonText = 'Switch';

  const onPress = () => {
    RtcEngineUnsafe.switchCamera();
    callbacks?.SwitchCamera && callbacks.SwitchCamera();
  };
  const isVideoEnabled = local.video === ToggleState.enabled;
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
  ) : isToolbarMenuItem ? (
    <ToolbarMenuItem {...iconButtonProps} />
  ) : (
    <IconButton {...iconButtonProps} />
  );
}

export default LocalSwitchCamera;

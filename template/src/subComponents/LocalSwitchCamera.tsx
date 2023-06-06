import React, {useContext} from 'react';
import {Text} from 'react-native';
import {useString} from '../utils/useString';
import {ClientRole, PropsContext, ToggleState} from '../../agora-rn-uikit';
import Styles from '../components/styles';
import {useLocalUserInfo, useRtc} from 'customization-api';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import {useToolbarMenu} from '../utils/useMenu';
import ToolbarMenuItem from '../atoms/ToolbarMenuItem';
import {useActionSheet} from '../utils/useActionSheet';

export interface LocalSwitchCameraProps {
  render?: (onPress: () => void, isVideoEnabled: boolean) => JSX.Element;
}

function LocalSwitchCamera(props: LocalSwitchCameraProps) {
  const {isToolbarMenuItem} = useToolbarMenu();
  const {callbacks} = useContext(PropsContext);
  const {RtcEngineUnsafe} = useRtc();
  const local = useLocalUserInfo();
  const {isOnActionSheet, showLabel} = useActionSheet();

  //commented for v1 release
  //const switchCameraButtonText = useString('switchCameraButton')();
  const switchCameraButtonText = 'Switch Camera';
  const {rtcProps} = useContext(PropsContext);
  const isLiveStream = $config.EVENT_MODE;
  const isAudience = rtcProps?.role == ClientRole.Audience;
  const isBroadCasting = rtcProps?.role == ClientRole.Broadcaster;
  const onPress = () => {
    RtcEngineUnsafe.switchCamera();
    callbacks?.SwitchCamera && callbacks.SwitchCamera();
  };
  const isVideoDisabled = useLocalUserInfo().video === ToggleState.disabled;
  const disabled =
    (isLiveStream && isAudience && !isBroadCasting) || isVideoDisabled;

  const isVideoEnabled = local.video === ToggleState.enabled;
  let iconButtonProps: IconButtonProps = {
    iconProps: {
      name: 'switch-camera',
      tintColor:
        isVideoEnabled || !disabled
          ? $config.SECONDARY_ACTION_COLOR
          : $config.SEMANTIC_NEUTRAL,
    },
    disabled: disabled,
    onPress: onPress,
    btnTextProps: {
      text: showLabel ? `Switch\nCamera` : '',
      numberOfLines: 2,
      textStyle: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '400',
        fontFamily: 'Source Sans Pro',
        textAlign: 'center',
        color: disabled ? $config.SEMANTIC_NEUTRAL : $config.FONT_COLOR,
      },
    },
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

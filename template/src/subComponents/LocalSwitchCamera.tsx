import React, {useContext} from 'react';
import {useString} from '../utils/useString';
import {PropsContext, ToggleState} from '../../agora-rn-uikit';
import Styles from '../components/styles';
import {useLocalUserInfo, useRtc} from 'customization-api';
import IconButton, {IconButtonProps} from '../atoms/IconButton';

export interface LocalSwitchCameraProps {
  hideLabel?: boolean;
  render?: (onPress: () => void, isVideoEnabled: boolean) => JSX.Element;
}

function LocalSwitchCamera(props: LocalSwitchCameraProps) {
  const {callbacks} = useContext(PropsContext);
  const {RtcEngine} = useRtc();
  const local = useLocalUserInfo();
  //commented for v1 release
  //const switchCameraButtonText = useString('switchCameraButton')();
  const switchCameraButtonText = 'Switch';

  const onPress = () => {
    RtcEngine.switchCamera();
    callbacks?.SwitchCamera && callbacks.SwitchCamera();
  };
  const isVideoEnabled = local.video === ToggleState.enabled;
  let iconButtonProps: IconButtonProps = {
    iconProps: {
      name: 'switchCamera',
      tintColor: '#099DFD',
    },
    disabled: isVideoEnabled ? false : true,
    onPress: onPress,
  };

  iconButtonProps.style = Styles.localButton as Object;
  iconButtonProps.btnText = props.hideLabel ? '' : switchCameraButtonText;

  return props?.render ? (
    props.render(onPress, isVideoEnabled)
  ) : (
    <IconButton {...iconButtonProps} />
  );
}

export default LocalSwitchCamera;

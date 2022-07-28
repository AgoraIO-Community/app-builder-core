import React, {useContext} from 'react';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import {useString} from '../utils/useString';
import {
  BtnTemplate,
  RtcContext,
  PropsContext,
  LocalContext,
  ToggleState,
  BtnTemplateInterface,
} from '../../agora-rn-uikit';
import Styles from '../components/styles';

export interface LocalSwitchCameraProps {
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    isVideoEnabled: boolean,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

function LocalSwitchCamera(props: LocalSwitchCameraProps) {
  const {callbacks} = useContext(PropsContext);
  const {RtcEngine} = useContext(RtcContext);
  const local = useContext(LocalContext);
  //commented for v1 release
  //const switchCameraButtonText = useString('switchCameraButton')();
  const switchCameraButtonText = 'Switch';

  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const onPress = () => {
    RtcEngine.switchCamera();
    callbacks?.SwitchCamera && callbacks.SwitchCamera();
  };
  const isVideoEnabled = local.video === ToggleState.enabled;
  let btnTemplateProps: BtnTemplateInterface = {
    name: 'switchCamera',
    disabled: isVideoEnabled ? false : true,
    onPress: onPress,
  };

  if (buttonTemplateName === ButtonTemplateName.topBar) {
    btnTemplateProps.style = Styles.fullWidthButton as Object;
  } else {
    btnTemplateProps.style = Styles.localButton as Object;
    btnTemplateProps.btnText = switchCameraButtonText;
  }

  return props?.render ? (
    props.render(onPress, isVideoEnabled, buttonTemplateName)
  ) : (
    <BtnTemplate {...btnTemplateProps} />
  );
}

export default LocalSwitchCamera;

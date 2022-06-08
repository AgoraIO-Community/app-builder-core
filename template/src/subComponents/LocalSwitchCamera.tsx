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
}

function LocalSwitchCamera(props: LocalSwitchCameraProps) {
  const {callbacks} = useContext(PropsContext);
  const {RtcEngine} = useContext(RtcContext);
  const local = useContext(LocalContext);
  const switchCameraButtonText = useString('switchCameraButton')();

  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;

  let btnTemplateProps: BtnTemplateInterface = {
    name: 'switchCamera',
    disabled: local.video === ToggleState.enabled ? false : true,
    onPress: () => {
      RtcEngine.switchCamera();
      callbacks?.SwitchCamera && callbacks.SwitchCamera();
    },
  };

  if (buttonTemplateName === ButtonTemplateName.topBar) {
    btnTemplateProps.style = Styles.fullWidthButton as Object;
  } else {
    btnTemplateProps.style = Styles.localButton as Object;
    btnTemplateProps.btnText = switchCameraButtonText;
  }

  return <BtnTemplate {...btnTemplateProps} />;
}

export default LocalSwitchCamera;

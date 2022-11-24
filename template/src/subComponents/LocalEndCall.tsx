import React, {useContext} from 'react';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import {BtnTemplate, BtnTemplateInterface} from '../../agora-rn-uikit';
import Styles from '../components/styles';
import {useString} from '../utils/useString';
import {useRtc} from 'customization-api';
import {useAuth} from '../auth/AuthProvider';

export interface LocalEndcallProps {
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

const LocalEndcall = (props: LocalEndcallProps) => {
  const {dispatch} = useRtc();
  const {authLogout} = useAuth();
  //commented for v1 release
  //const endCallLabel = useString('endCallButton')();
  const endCallLabel = 'Hang Up';
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const onPress = () => {
    try {
      dispatch({
        type: 'EndCall',
        value: [],
      });
      authLogout();
    } catch (error) {}
  };
  let btnTemplateProps: BtnTemplateInterface = {
    name: 'callEnd',
    color: '#FD0845',
    onPress: onPress,
  };

  if (buttonTemplateName === ButtonTemplateName.topBar) {
    btnTemplateProps.style = Styles.fullWidthButton as Object;
  } else {
    btnTemplateProps.btnText = endCallLabel;
    btnTemplateProps.style = Styles.endCall as Object;
  }
  return props?.render ? (
    props.render(onPress, buttonTemplateName)
  ) : (
    <BtnTemplate {...btnTemplateProps} />
  );
};
export default LocalEndcall;

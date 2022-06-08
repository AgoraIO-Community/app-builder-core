import React, {useContext} from 'react';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import {
  BtnTemplate,
  BtnTemplateInterface,
  RtcContext,
} from '../../agora-rn-uikit';
import Styles from '../components/styles';
import {useString} from '../utils/useString';

export interface LocalEndcallProps {
  buttonTemplateName?: ButtonTemplateName;
}

const LocalEndcall = (props: LocalEndcallProps) => {
  const {dispatch} = useContext(RtcContext);
  const endCallLabel = useString('endCallButton')();
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;

  let btnTemplateProps: BtnTemplateInterface = {
    name: 'callEnd',
    color: '#FD0845',
    onPress: () =>
      dispatch({
        type: 'EndCall',
        value: [],
      }),
  };

  if (buttonTemplateName === ButtonTemplateName.topBar) {
    btnTemplateProps.style = Styles.fullWidthButton as Object;
  } else {
    btnTemplateProps.btnText = endCallLabel;
    btnTemplateProps.style = Styles.endCall as Object;
  }
  return <BtnTemplate {...btnTemplateProps} />;
};
export default LocalEndcall;

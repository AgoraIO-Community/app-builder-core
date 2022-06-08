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
  render?: (
    onPress: () => void,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

const LocalEndcall = (props: LocalEndcallProps) => {
  const {dispatch} = useContext(RtcContext);
  const endCallLabel = useString('endCallButton')();
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const onPress = () =>
    dispatch({
      type: 'EndCall',
      value: [],
    });
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

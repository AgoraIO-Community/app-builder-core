import React, {useContext, useState} from 'react';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import {
  BtnTemplate,
  BtnTemplateInterface,
  ImageIcon,
} from '../../agora-rn-uikit';
import Styles from '../components/styles';
import {useString} from '../utils/useString';
import {View, Text, TouchableOpacity} from 'react-native';
import {useRtc} from 'customization-api';
import EndcallPopup from './EndcallPopup';
import StorageContext from '../components/StorageContext';
import {useParams} from '../components/Router';

export interface LocalEndcallProps {
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

const LocalEndcall = (props: LocalEndcallProps) => {
  const {dispatch} = useRtc();
  //commented for v1 release
  //const endCallLabel = useString('endCallButton')();
  const endCallLabel = 'End';
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const isActionBarTemplate =
    buttonTemplateName === ButtonTemplateName.actionBar;
  const {setStore} = useContext(StorageContext);
  const [endcallVisible, setEndcallVisible] = useState(false);
  const {phrase} = useParams<{phrase: string}>();
  const onPress = () => {
    setEndcallVisible(true);
  };

  const endCall = async () => {
    setStore((prevState) => {
      return {
        ...prevState,
        lastMeetingPhrase: phrase,
      };
    });
    setTimeout(() => {
      dispatch({
        type: 'EndCall',
        value: [],
      });
    });
  };

  return props?.render ? (
    props.render(onPress, buttonTemplateName)
  ) : (
    <>
      <EndcallPopup
        endCall={endCall}
        setModalVisible={setEndcallVisible}
        modalVisible={endcallVisible}
      />
      <TouchableOpacity
        style={!isActionBarTemplate && (Styles.endCallContainer as object)}
        onPress={onPress}>
        <ImageIcon
          style={
            isActionBarTemplate
              ? Styles.actionSheetButton
              : {
                  width: 20,
                  height: 20,
                }
          }
          name={'endCall'}
        />
        {!isActionBarTemplate && (
          <Text style={Styles.endCallText as object}>{endCallLabel}</Text>
        )}
      </TouchableOpacity>
    </>
  );
};
export default LocalEndcall;

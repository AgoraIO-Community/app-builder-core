import React, {useContext, useState} from 'react';
import Styles from '../components/styles';
import {useString} from '../utils/useString';
import {View, Text, TouchableOpacity} from 'react-native';
import {useRtc} from 'customization-api';
import EndcallPopup from './EndcallPopup';
import StorageContext from '../components/StorageContext';
import {useParams} from '../components/Router';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
export interface LocalEndcallProps {
  showLabel?: boolean;
  render?: (onPress: () => void) => JSX.Element;
}

const LocalEndcall = (props: LocalEndcallProps) => {
  const {dispatch} = useRtc();
  const {showLabel = $config.ICON_TEXT} = props;
  //commented for v1 release
  //const endCallLabel = useString('endCallButton')();
  const endCallLabel = 'Leave';
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

  let iconButtonProps: IconButtonProps = {
    iconProps: {
      name: 'end-call',
      tintColor: $config.PRIMARY_ACTION_TEXT_COLOR,
      iconBackgroundColor: $config.SEMANTIC_ERROR,
      iconContainerStyle: {
        width: 69,
        alignItems: 'center',
      },
    },
    onPress,
    btnTextProps: {
      text: showLabel ? endCallLabel : '',
      textColor: $config.FONT_COLOR,
    },
  };

  return props?.render ? (
    props.render(onPress)
  ) : (
    <>
      <EndcallPopup
        endCall={endCall}
        setModalVisible={setEndcallVisible}
        modalVisible={endcallVisible}
      />
      <IconButton {...iconButtonProps} />
    </>
  );
};
export default LocalEndcall;

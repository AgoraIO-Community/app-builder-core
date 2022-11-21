import React, {useContext, useState} from 'react';
import Styles from '../components/styles';
import {useString} from '../utils/useString';
import {View, Text, TouchableOpacity} from 'react-native';
import {useRtc} from 'customization-api';
import EndcallPopup from './EndcallPopup';
import StorageContext from '../components/StorageContext';
import {useParams} from '../components/Router';
import ImageIcon from '../atoms/ImageIcon';
export interface LocalEndcallProps {
  render?: (onPress: () => void) => JSX.Element;
}

const LocalEndcall = (props: LocalEndcallProps) => {
  const {dispatch} = useRtc();
  //commented for v1 release
  //const endCallLabel = useString('endCallButton')();
  const endCallLabel = 'End';

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
    props.render(onPress)
  ) : (
    <>
      <EndcallPopup
        endCall={endCall}
        setModalVisible={setEndcallVisible}
        modalVisible={endcallVisible}
      />
      <TouchableOpacity
        style={Styles.endCallContainer as object}
        onPress={onPress}>
        <ImageIcon name={'endCall'} tintColor={'#FFFFFF'} />
        <Text style={Styles.endCallText as object}>{endCallLabel}</Text>
      </TouchableOpacity>
    </>
  );
};
export default LocalEndcall;

import React, {useContext, useState} from 'react';
import {useRtc} from 'customization-api';
import {useAuth} from '../auth/AuthProvider';

import EndcallPopup from './EndcallPopup';
import StorageContext from '../components/StorageContext';
import {Prompt, useParams} from '../components/Router';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {Platform} from 'react-native';
export interface LocalEndcallProps {
  showLabel?: boolean;
  isOnActionSheet?: boolean;
  render?: (onPress: () => void) => JSX.Element;
}

/* For android only, bg audio */
const stopForegroundService = () => {
  if (Platform.OS === 'android') {
    ReactNativeForegroundService.stop();
    console.log('stopping foreground service');
  }
};

const LocalEndcall = (props: LocalEndcallProps) => {
  const {dispatch} = useRtc();
  const {authLogout} = useAuth();
  const {showLabel = $config.ICON_TEXT, isOnActionSheet = false} = props;
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
    setTimeout(() => {
      dispatch({
        type: 'EndCall',
        value: [],
      });
    });
    authLogout();
    // stopping foreground servie on end call
    stopForegroundService();
  };

  let iconButtonProps: IconButtonProps = {
    iconProps: {
      name: 'end-call',
      tintColor: $config.PRIMARY_ACTION_TEXT_COLOR,
      iconBackgroundColor: $config.SEMANTIC_ERROR,
      iconContainerStyle: !isOnActionSheet && {
        width: 72,
        height: 52,
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
      <Prompt
        when={true}
        message={(location, action) => {
          if (action === 'POP') {
            onPress();
            return false;
          }
          return true;
        }}
      />
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

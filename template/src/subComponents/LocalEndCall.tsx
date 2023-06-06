import React, {useContext, useState} from 'react';
import {useRtc} from 'customization-api';

import EndcallPopup from './EndcallPopup';
import StorageContext from '../components/StorageContext';
import {Prompt, useParams} from '../components/Router';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {Platform} from 'react-native';
import {DispatchContext} from '../../agora-rn-uikit';
import {useToolbarMenu} from '../utils/useMenu';
import ToolbarMenuItem from '../atoms/ToolbarMenuItem';
import {useActionSheet} from '../utils/useActionSheet';

export interface LocalEndcallProps {
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
  const {isToolbarMenuItem} = useToolbarMenu();
  const {dispatch} = useContext(DispatchContext);
  const {isOnActionSheet, isOnFirstRow, showLabel} = useActionSheet();
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

  if (isOnActionSheet) {
    // iconButtonProps.containerStyle = {
    //   backgroundColor: 'white',
    //   width: 52,
    //   height: 52,
    //   borderRadius: 26,
    //   justifyContent: 'center',
    //   alignItems: 'center',
    // };
    iconButtonProps.btnTextProps.textStyle = {
      color: $config.FONT_COLOR,
      marginTop: 8,
      fontSize: 12,
      fontWeight: '400',
      fontFamily: 'Source Sans Pro',
      textAlign: 'center',
    };
  }

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
      {isToolbarMenuItem ? (
        <ToolbarMenuItem {...iconButtonProps} />
      ) : (
        <IconButton {...iconButtonProps} />
      )}
    </>
  );
};
export default LocalEndcall;

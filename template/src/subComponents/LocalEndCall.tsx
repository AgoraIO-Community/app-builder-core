import React, {useContext, useEffect, useState} from 'react';
import {isAndroid, isIOS, useContent, useRoomInfo} from 'customization-api';
import EndcallPopup from './EndcallPopup';
import {Prompt} from '../components/Router';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {Platform} from 'react-native';
import {useScreenshare} from './screenshare/useScreenshare';
import {useToolbarMenu} from '../utils/useMenu';
import ToolbarMenuItem from '../atoms/ToolbarMenuItem';
import {useActionSheet} from '../utils/useActionSheet';
import {useString} from '../../src/utils/useString';
import {toolbarItemLeaveText} from '../../src/language/default-labels/videoCallScreenLabels';
import {LogSource, logger} from '../logger/AppBuilderLogger';
import useEndCall from '../utils/useEndCall';

export interface LocalEndcallProps {
  render?: (onPress: () => void) => JSX.Element;
  customExit?: () => void;
}

/* For android only, bg audio */
export const stopForegroundService = () => {
  if (Platform.OS === 'android') {
    ReactNativeForegroundService.stop();
    logger.debug(
      LogSource.Internals,
      'CONTROLS',
      'Local end call - stopping foreground service, bg audio for android only',
    );
  }
};

const LocalEndcall = (props: LocalEndcallProps) => {
  const {isScreenshareActive, stopScreenshare} = useScreenshare();
  const {isToolbarMenuItem} = useToolbarMenu();
  const {isOnActionSheet, showLabel} = useActionSheet();
  const endCallLabel = useString(toolbarItemLeaveText)();
  const [endcallVisible, setEndcallVisible] = useState(false);
  const onPress = () => {
    setEndcallVisible(true);
  };
  const [endCallState, setEndCallState] = useState(false);
  const executeEndCall = useEndCall();

  useEffect(() => {
    if (!isScreenshareActive && endCallState) {
      executeEndCall();
      setEndCallState(false);
    }
  }, [isScreenshareActive, endCallState]);

  const endCall = async () => {
    if (props?.customExit) {
      props.customExit();
    } else {
      if ((isAndroid() || isIOS()) && isScreenshareActive) {
        stopScreenshare();
        setEndCallState(true);
      } else {
        executeEndCall();
      }
    }
  };

  let iconButtonProps: IconButtonProps = {
    iconProps: {
      name: 'end-call',
      tintColor: $config.PRIMARY_ACTION_TEXT_COLOR,
      iconBackgroundColor: $config.SEMANTIC_ERROR,
      iconContainerStyle: !isOnActionSheet && {
        width: 72,
        height: $config.ICON_TEXT ? 52 : 48,
      },
    },
    onPress,
    btnTextProps: {
      text: showLabel ? endCallLabel : '',
      textColor: $config.FONT_COLOR,
    },
  };
  iconButtonProps.isOnActionSheet = isOnActionSheet;
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

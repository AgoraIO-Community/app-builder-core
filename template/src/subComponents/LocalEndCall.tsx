import React, {useContext, useEffect, useState} from 'react';
import {isAndroid, isIOS, useRtc, useRender} from 'customization-api';
import EndcallPopup from './EndcallPopup';
import StorageContext from '../components/StorageContext';
import {Prompt, useParams} from '../components/Router';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {Platform} from 'react-native';
import useSTTAPI from './caption/useSTTAPI';
import {useCaption} from './caption/useCaption';
import {useScreenshare} from './screenshare/useScreenshare';
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
  const {isScreenshareActive, stopUserScreenShare} = useScreenshare();
  const {showLabel = $config.ICON_TEXT, isOnActionSheet = false} = props;
  //commented for v1 release
  //const endCallLabel = useString('endCallButton')();
  const endCallLabel = 'Leave';
  const {setStore} = useContext(StorageContext);
  const [endcallVisible, setEndcallVisible] = useState(false);
  const {stop} = useSTTAPI();
  const {renderList} = useRender();
  const {isSTTActive} = useCaption();
  const {phrase} = useParams<{phrase: string}>();
  const onPress = () => {
    setEndcallVisible(true);
  };
  const [endCallState, setEndCallState] = useState(false);

  const executeEndCall = () => {
    setTimeout(() => {
      dispatch({
        type: 'EndCall',
        value: [],
      });
    });
    // stopping foreground servie on end call
    stopForegroundService();
    // stopping STT on call end,if only last user is remaining in call
    const usersInCall = Object.entries(renderList).filter(
      (item) => item[1].type === 'rtc',
    );
    usersInCall.length === 1 && isSTTActive && stop();
  };

  useEffect(() => {
    if (!isScreenshareActive && endCallState) {
      executeEndCall();
      setEndCallState(false);
    }
  }, [isScreenshareActive, endCallState]);

  const endCall = async () => {
    if ((isAndroid() || isIOS()) && isScreenshareActive) {
      stopUserScreenShare();
      setEndCallState(true);
    } else {
      executeEndCall();
    }
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

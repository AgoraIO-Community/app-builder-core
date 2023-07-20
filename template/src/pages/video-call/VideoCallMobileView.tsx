import {StyleSheet, Text, View, AppState} from 'react-native';
import React, {useRef, useContext, useState, useEffect} from 'react';
import VideoComponent from './VideoComponent';
import ActionSheet from './ActionSheet';
import ThemeConfig from '../../theme';
import Spacer from '../../atoms/Spacer';
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';

import {useRecording} from '../../subComponents/recording/useRecording';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import ParticipantsCount from '../../atoms/ParticipantsCount';
import RecordingInfo from '../../atoms/RecordingInfo';
import {isAndroid, isWebInternal, trimText} from '../../utils/common';
import {RtcContext, ToggleState, useLocalUid} from '../../../agora-rn-uikit';
import {useLocalUserInfo, useRender} from 'customization-api';
import CaptionContainer from '../../subComponents/caption/CaptionContainer';
import {EventNames} from '../../rtm-events';
import events from '../../rtm-events-api';
import ImageIcon from '../../atoms/ImageIcon';
import {useCaption} from '../../subComponents/caption/useCaption';
import {getLanguageLabel} from '../../subComponents/caption/utils';
import Toast from '../../../react-native-toast-message';

const VideoCallMobileView = () => {
  const {
    data: {meetingTitle},
  } = useMeetingInfo();
  const {isRecordingActive} = useRecording();
  const recordingLabel = 'Recording';

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const {RtcEngine, dispatch} = useContext(RtcContext);
  const local = useLocalUserInfo();

  const isCamON = useRef(local.video);

  // moved below logic to useMuteToggleLocal
  // useEffect(() => {
  //   if ($config.AUDIO_ROOM) return;
  //   const subscription = AppState.addEventListener(
  //     'change',
  //     async (nextAppState) => {
  //       if (nextAppState === 'background') {
  //         // check if cam was on before app goes to background
  //         isCamON.current = isAndroid()
  //           ? local.video === ToggleState.enabled
  //           : RtcEngine?.isVideoEnabled;

  //         if (isCamON.current || 1) {
  //           isWebInternal()
  //             ? await RtcEngine.muteLocalVideoStream(true)
  //             : await RtcEngine.enableLocalVideo(false);

  //           // dispatch({
  //           //   type: 'LocalMuteVideo',
  //           //   value: [0],
  //           // });
  //         }
  //       }
  //       if (nextAppState === 'active') {
  //         // enable cam only if cam was on before app goes to background
  //         console.log('active state 111111 ==>', isCamON.current);
  //         if (local.video) {
  //           isWebInternal()
  //             ? await RtcEngine.muteLocalVideoStream(false)
  //             : await RtcEngine.enableLocalVideo(true);
  //           dispatch({
  //             type: 'LocalMuteVideo',
  //             value: [1],
  //           });
  //         }
  //       }
  //       appState.current = nextAppState;
  //     },
  //   );

  //   return () => {
  //     subscription?.remove();
  //   };
  // }, []);
  const {setIsSTTActive, setLanguage, isCaptionON} = useCaption();
  React.useEffect(() => {
    events.on(EventNames.STT_ACTIVE, (data) => {
      const payload = JSON.parse(data?.payload);
      setIsSTTActive(payload.active);
    });

    events.on(EventNames.STT_LANGUAGE, (data) => {
      const payload = JSON.parse(data?.payload);
      const msg = `${
        payload.username
      } changed the spoken language to ${getLanguageLabel(payload.language)} `;

      Toast.show({
        type: 'info',
        leadingIcon: <ToastIcon color={$config.SECONDARY_ACTION_COLOR} />,
        text1: msg,
        visibilityTime: 3000,
      });
      // syncing local set language
      payload && setLanguage(payload.language);
    });
  }, []);

  const ToastIcon = ({color}) => (
    <View style={{marginRight: 12, alignSelf: 'center', width: 24, height: 24}}>
      <ImageIcon iconType="plain" tintColor={color} name={'lang-select'} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>{trimText(meetingTitle)}</Text>
        <Spacer size={8} horizontal={false} />
        <View style={styles.countView}>
          <View
            style={{
              width: 45,
              height: 35,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              zIndex: isWebInternal() ? 3 : 0,

              //flex: 1,
            }}>
            <ParticipantsCount />
          </View>
          {isRecordingActive ? (
            <RecordingInfo recordingLabel={recordingLabel} />
          ) : (
            <></>
          )}
        </View>
      </View>
      <Spacer size={16} />
      <View style={styles.videoView}>
        <VideoComponent />
        {isCaptionON && <CaptionContainer />}
      </View>
      <ActionSheet />
    </View>
  );
};

export default VideoCallMobileView;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flex: 1,
  },
  title: {
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: ThemeConfig.FontSize.normal,
    color: $config.FONT_COLOR,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    paddingVertical: 2,
  },
  videoView: {
    flex: 0.85,
    zIndex: 0,
    elevation: 0,
  },
  titleBar: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  countView: {
    flexDirection: 'row',
  },
});

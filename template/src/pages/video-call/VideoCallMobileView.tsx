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
import {isAndroid, trimText} from '../../utils/common';
import {RtcContext, ToggleState, useLocalUid} from '../../../agora-rn-uikit';
import {useLocalUserInfo, useRender} from 'customization-api';

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

  useEffect(() => {
    if ($config.AUDIO_ROOM) return;
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        // check if cam was on before app goes to background
        isCamON.current = isAndroid()
          ? local.video === ToggleState.enabled
          : RtcEngine?.isVideoEnabled;

        if (isCamON.current) {
          RtcEngine.muteLocalVideoStream(true);
          dispatch({
            type: 'LocalMuteVideo',
            value: [0],
          });
        }
      }
      if (nextAppState === 'active') {
        // enable cam only if cam was on before app goes to background
        if (isCamON.current) {
          RtcEngine.muteLocalVideoStream(false);
          dispatch({
            type: 'LocalMuteVideo',
            value: [1],
          });
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, []);

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
    flex: 0.8,
  },
  titleBar: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  countView: {
    flexDirection: 'row',
  },
});

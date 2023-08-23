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
import {
  isAndroid,
  isIOS,
  isMobileUA,
  isWebInternal,
  trimText,
} from '../../utils/common';
import {RtcContext, ToggleState, useLocalUid} from '../../../agora-rn-uikit';
import {useLocalUserInfo, useRender} from 'customization-api';
import CaptionContainer from '../../subComponents/caption/CaptionContainer';
import {EventNames} from '../../rtm-events';
import events from '../../rtm-events-api';
import ImageIcon from '../../atoms/ImageIcon';
import {useCaption} from '../../subComponents/caption/useCaption';
import {getLanguageLabel} from '../../subComponents/caption/utils';
import Toast from '../../../react-native-toast-message';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import VideoRenderer from './VideoRenderer';
import {filterObject} from '../../utils';
import {useScreenshare} from '../../subComponents/screenshare/useScreenshare';

const VideoCallMobileView = () => {
  const {
    data: {meetingTitle},
  } = useMeetingInfo();
  const {isRecordingActive} = useRecording();
  const recordingLabel = 'Recording';
  const {isScreenShareOnFullView, screenShareData} = useScreenContext();

  const {RtcEngine, dispatch} = useContext(RtcContext);
  const local = useLocalUserInfo();
  const {renderList} = useRender();

  const renderListRef = React.useRef(renderList);

  React.useEffect(() => {
    renderListRef.current = renderList;
  }, [renderList]);
  const maxScreenShareData = filterObject(
    screenShareData,
    ([k, v]) => v?.isExpanded === true,
  );
  const maxScreenShareUid = Object.keys(maxScreenShareData)?.length
    ? Object.keys(maxScreenShareData)[0]
    : null;

  const appState = useRef(AppState.currentState);
  const {isScreenshareActive} = useScreenshare();
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const isCamON = useRef(local.video);
  const isScreenShareOn = useRef(isScreenshareActive);

  useEffect(() => {
    if ($config.AUDIO_ROOM || !isMobileUA()) return;
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });
    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    // console.log(`Video State  ${local.video} in Mode  ${appStateVisible}`);
    //native screenshare use local uid to publish the screenshare stream
    //so when user minimize the app we shouldnot pause the local video
    if (
      appStateVisible === 'background' &&
      isScreenshareActive &&
      (isAndroid() || isIOS())
    ) {
      isScreenShareOn.current = true;
    }
    if (
      appStateVisible === 'active' &&
      !isScreenshareActive &&
      (isAndroid() || isIOS())
    ) {
      isScreenShareOn.current = false;
    }
    if (!((isAndroid() || isIOS()) && isScreenshareActive)) {
      if (appStateVisible === 'background') {
        isCamON.current =
          isAndroid() || isIOS()
            ? local.video && !isScreenShareOn.current
            : local.video;
        if (isCamON.current) {
          isWebInternal()
            ? RtcEngine.muteLocalVideoStream(true)
            : RtcEngine.enableLocalVideo(false);
          dispatch({
            type: 'LocalMuteVideo',
            value: [0],
          });
        }
      }
      if (appStateVisible === 'active' && isCamON.current) {
        isWebInternal()
          ? RtcEngine.muteLocalVideoStream(false)
          : RtcEngine.enableLocalVideo(true);
        dispatch({
          type: 'LocalMuteVideo',
          value: [1],
        });
      }
    }
  }, [appStateVisible, isScreenshareActive]);

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
  const {setIsSTTActive, setLanguage, isCaptionON, setMeetingTranscript} =
    useCaption();
  React.useEffect(() => {
    events.on(EventNames.STT_ACTIVE, (data) => {
      const payload = JSON.parse(data?.payload);
      setIsSTTActive(payload.active);
    });

    events.on(EventNames.STT_LANGUAGE, (data) => {
      const {username, prevLang, newLang, uid} = JSON.parse(data?.payload);
      const actionText =
        prevLang.indexOf('') !== -1
          ? `has set the spoken language to  "${getLanguageLabel(newLang)}" `
          : `changed the spoken language from "${getLanguageLabel(
              prevLang,
            )}" to "${getLanguageLabel(newLang)}" `;
      const msg = `${renderListRef[uid]?.name || username} ${actionText} `;

      Toast.show({
        type: 'info',
        leadingIcon: <ToastIcon color={$config.SECONDARY_ACTION_COLOR} />,
        text1: `Spoken Language ${
          prevLang.indexOf('') !== -1 ? 'Set' : 'Changed'
        }`,
        visibilityTime: 3000,
        text2: msg,
        primaryBtn: null,
        secondaryBtn: null,
      });
      // syncing local set language
      newLang && setLanguage(newLang);
      // add spoken lang msg to transcript
      setMeetingTranscript((prev) => {
        return [
          ...prev,
          {
            name: 'langUpdate',
            time: new Date().getTime(),
            uid: `langUpdate-${uid}`,
            text: actionText,
          },
        ];
      });
    });
  }, []);

  const ToastIcon = ({color}) => (
    <View style={{marginRight: 12, alignSelf: 'center', width: 24, height: 24}}>
      <ImageIcon iconType="plain" tintColor={color} name={'lang-select'} />
    </View>
  );

  return (
    <>
      {isScreenShareOnFullView &&
      maxScreenShareUid &&
      renderList[maxScreenShareUid] &&
      renderList[maxScreenShareUid]?.video ? (
        <VideoRenderer user={renderList[maxScreenShareUid]} />
      ) : (
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
      )}
    </>
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

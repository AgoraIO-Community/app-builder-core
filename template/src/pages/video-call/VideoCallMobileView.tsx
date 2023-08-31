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
import ImageIcon from '../../atoms/ImageIcon';
import {useScreenContext} from '../../components/contexts/ScreenShareContext';
import VideoRenderer from './VideoRenderer';
import {filterObject} from '../../utils';
import {useScreenshare} from '../../subComponents/screenshare/useScreenshare';
import useAppState from '../../utils/useAppState';

const VideoCallMobileView = () => {
  const {isScreenShareOnFullView, screenShareData} = useScreenContext();

  const {RtcEngine, dispatch} = useContext(RtcContext);
  const local = useLocalUserInfo();
  const {renderList} = useRender();

  const maxScreenShareData = filterObject(
    screenShareData,
    ([k, v]) => v?.isExpanded === true,
  );
  const maxScreenShareUid = Object.keys(maxScreenShareData)?.length
    ? Object.keys(maxScreenShareData)[0]
    : null;

  const {isScreenshareActive} = useScreenshare();
  const appStateVisible = useAppState();
  const isCamON = useRef(local.video);
  const isScreenShareOn = useRef(isScreenshareActive);

  useEffect(() => {
    // console.log(`Video State  ${local.video} in Mode  ${appStateVisible}`);
    //native screenshare use local uid to publish the screenshare stream
    //so when user minimize the app we shouldnot pause the local video
    if ($config.AUDIO_ROOM || !isMobileUA()) {
      return;
    } else {
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
    }
  }, [appStateVisible, isScreenshareActive]);

  return isScreenShareOnFullView &&
    maxScreenShareUid &&
    renderList[maxScreenShareUid] &&
    renderList[maxScreenShareUid]?.video ? (
    <VideoRenderer user={renderList[maxScreenShareUid]} />
  ) : (
    <VideoCallView />
  );
};

const VideoCallView = React.memo(() => {
  return (
    <View style={styles.container}>
      <VideoCallHeader />
      <Spacer size={16} />
      <View style={styles.videoView}>
        <VideoComponent />
        <CaptionContainer />
      </View>
      <ActionSheet />
    </View>
  );
});

const VideoCallHeader = () => {
  const {
    data: {meetingTitle},
  } = useMeetingInfo();
  const {isRecordingActive} = useRecording();
  const recordingLabel = 'Recording';
  return (
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

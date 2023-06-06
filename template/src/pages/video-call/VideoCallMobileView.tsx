import {StyleSheet, Text, View, AppState} from 'react-native';
import React, {useRef, useContext, useState, useEffect} from 'react';
import VideoComponent from './VideoComponent';
import ActionSheet from './ActionSheet';
import ThemeConfig from '../../theme';
import Spacer from '../../atoms/Spacer';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';

import {useRecording} from '../../subComponents/recording/useRecording';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import ParticipantsCount from '../../atoms/ParticipantsCount';
import RecordingInfo from '../../atoms/RecordingInfo';
import {
  isAndroid,
  isValidReactComponent,
  isWebInternal,
  trimText,
} from '../../utils/common';
import {ToggleState, useLocalUid} from '../../../agora-rn-uikit';
import {
  useLocalUserInfo,
  useContent,
  ToolbarCustomItem,
} from 'customization-api';
import NavbarMobile, {NavbarProps} from '../../components/NavbarMobile';
import {useCustomization} from 'customization-implementation';
import {ToolbarPosition, ToolbarProvider} from '../../utils/useToolbar';
import {ControlsProps} from '../../components/Controls';
import {ActionSheetProvider} from '../../utils/useActionSheet';

const VideoCallMobileView = () => {
  const {
    data: {meetingTitle},
  } = useRoomInfo();
  const {isRecordingActive} = useRecording();
  const recordingLabel = 'Recording';

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
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
  //           : RtcEngineUnsafe?.isVideoEnabled;

  //         if (isCamON.current || 1) {
  //           isWebInternal()
  //             ? await RtcEngineUnsafe.muteLocalVideoStream(true)
  //             : await RtcEngineUnsafe.enableLocalVideo(false);

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
  //             ? await RtcEngineUnsafe.muteLocalVideoStream(false)
  //             : await RtcEngineUnsafe.enableLocalVideo(true);
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

  const {BottombarComponent, BottombarProps, TopbarComponent, TopbarProps} =
    useCustomization((data) => {
      let components: {
        BottombarComponent: React.ComponentType<ControlsProps>;
        BottombarProps?: ToolbarCustomItem[];
        TopbarComponent: React.ComponentType<NavbarProps>;
        TopbarProps?: ToolbarCustomItem[];
      } = {
        BottombarComponent: ActionSheet,
        BottombarProps: [],
        TopbarComponent: NavbarMobile,
        TopbarProps: [],
      };
      if (
        data?.components?.videoCall &&
        typeof data?.components?.videoCall === 'object'
      ) {
        if (
          data?.components?.videoCall.bottomToolBar &&
          typeof data?.components?.videoCall.bottomToolBar !== 'object' &&
          isValidReactComponent(data?.components?.videoCall.bottomToolBar)
        ) {
          components.BottombarComponent =
            data?.components?.videoCall.bottomToolBar;
        }
        if (
          data?.components?.videoCall.bottomToolBar &&
          typeof data?.components?.videoCall.bottomToolBar === 'object' &&
          data?.components?.videoCall.bottomToolBar.length
        ) {
          components.BottombarProps = data?.components?.videoCall.bottomToolBar;
        }

        if (
          data?.components?.videoCall.topToolBar &&
          typeof data?.components?.videoCall.topToolBar !== 'object' &&
          isValidReactComponent(data?.components?.videoCall.topToolBar)
        ) {
          components.TopbarComponent = data?.components?.videoCall.topToolBar;
        }

        if (
          data?.components?.videoCall.topToolBar &&
          typeof data?.components?.videoCall.topToolBar === 'object' &&
          data?.components?.videoCall.topToolBar.length
        ) {
          components.TopbarProps = data?.components?.videoCall.topToolBar;
        }
      }

      return components;
    });

  return (
    <View style={styles.container}>
      <ToolbarProvider value={{position: ToolbarPosition.top}}>
        {TopbarProps?.length ? (
          <TopbarComponent
            customItems={TopbarProps}
            includeDefaultItems={false}
          />
        ) : (
          <TopbarComponent />
        )}
      </ToolbarProvider>
      {/* <View style={styles.titleBar}>
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
      </View> */}
      {/* <Spacer size={16} /> */}
      <View style={styles.videoView}>
        <VideoComponent />
      </View>
      <ToolbarProvider value={{position: ToolbarPosition.bottom}}>
        <ActionSheetProvider>
          {BottombarProps?.length ? (
            <BottombarComponent
              customItems={BottombarProps}
              includeDefaultItems={false}
            />
          ) : (
            <BottombarComponent />
          )}
        </ActionSheetProvider>
      </ToolbarProvider>
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

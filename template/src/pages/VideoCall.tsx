/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useState, useContext, useEffect} from 'react';
import {View, StyleSheet, Text, Platform} from 'react-native';

import {
  RtcConfigure,
  PropsProvider,
  ClientRole,
  ChannelProfile,
} from '../../agora-rn-uikit';
import Navbar from '../components/Navbar';
import ParticipantsView from '../components/ParticipantsView';
import SettingsView from '../components/SettingsView';
import PinnedVideo from '../components/PinnedVideo';
import Controls from '../components/Controls';
import GridVideo from '../components/GridVideo';
import styles from '../components/styles';
import {useParams, useHistory} from '../components/Router';
import Chat from '../components/Chat';
import RtmConfigure from '../components/RTMConfigure';
import DeviceConfigure from '../components/DeviceConfigure';
import {gql, useQuery} from '@apollo/client';
import StorageContext from '../components/StorageContext';
import Logo from '../subComponents/Logo';
import {
  cmpTypeGuard,
  hasBrandLogo,
  isAndroid,
  isValidElementType,
  isWeb,
} from '../utils/common';
import ChatContext, {
  messageActionType,
  messageChannelType,
} from '../components/ChatContext';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {videoView} from '../../theme.json';
import Layout from '../subComponents/LayoutEnum';
import Toast from '../../react-native-toast-message';
import {NetworkQualityProvider} from '../components/NetworkQualityContext';
import {LiveStreamContextProvider} from '../components/livestream';
import ScreenshareConfigure from '../subComponents/screenshare/ScreenshareConfigure';
import {ErrorContext} from '.././components/common/index';
import {PreCallProvider} from '../components/precall/usePreCall';
import {VideoCallProvider} from './video-call/useVideoCall';
import {ChatUIDataProvider} from '../components/useChatUI';
import {useFpe} from 'fpe-api';
import Precall from '../components/Precall';
import VideoArrayRenderer from './video-call/VideoArrayRenderer';
import CustomUserContextHolder from './video-call/CustomUserContextHolder';
import {useVideoCall} from './video-call/useVideoCall';
import {useString} from '../utils/useString';
import {DefaultLayouts} from './video-call/DefaultLayouts';
import useCustomLayout from './video-call/CustomLayout';

const useChatNotification = (
  messageStore: string | any[],
  privateMessageStore: string | any[],
  chatDisplayed: boolean,
  isPrivateChatDisplayed: boolean,
) => {
  // store the last checked state from the messagestore, to identify unread messages
  const [lastCheckedPublicState, setLastCheckedPublicState] = useState(0);
  const [lastCheckedPrivateState, setLastCheckedPrivateState] = useState({});
  useEffect(() => {
    if (chatDisplayed && !isPrivateChatDisplayed) {
      setLastCheckedPublicState(messageStore.length);
    }
  }, [messageStore, isPrivateChatDisplayed]);

  const setPrivateMessageLastSeen = ({userId, lastSeenCount}) => {
    setLastCheckedPrivateState((prevState) => {
      return {...prevState, [userId]: lastSeenCount || 0};
    });
  };
  return [
    lastCheckedPublicState,
    setLastCheckedPublicState,
    lastCheckedPrivateState,
    setLastCheckedPrivateState,
    setPrivateMessageLastSeen,
  ];
};

const NotificationControl = ({
  children,
  chatDisplayed,
  setSidePanel,
  isPrivateChatDisplayed,
}) => {
  const {messageStore, privateMessageStore, userList, localUid, events} =
    useContext(ChatContext);
  const [
    lastCheckedPublicState,
    setLastCheckedPublicState,
    lastCheckedPrivateState,
    setLastCheckedPrivateState,
    setPrivateMessageLastSeen,
  ] = useChatNotification(
    messageStore,
    privateMessageStore,
    chatDisplayed,
    isPrivateChatDisplayed,
  );
  const fromText = useString('messageSenderNotificationLabel');
  const pendingPublicNotification =
    messageStore.length - lastCheckedPublicState;
  const privateMessageCountMap = Object.keys(privateMessageStore).reduce(
    (acc, curItem) => {
      let individualPrivateMessageCount = privateMessageStore[curItem].reduce(
        (total, item) => {
          if (isAndroid) {
            //In template/src/components/RTMConfigure.tsx
            //on messageReceived event - For android platform we are passing uid as number type. so checking == for android
            return item.uid == curItem ? total + 1 : total;
          } else {
            return item.uid === curItem ? total + 1 : total;
          }
        },
        0,
      );
      return {...acc, [curItem]: individualPrivateMessageCount};
    },
    {},
  );
  const totalPrivateMessage = Object.keys(privateMessageCountMap).reduce(
    (acc, item) => acc + privateMessageCountMap[item],
    0,
  );
  const totalPrivateLastSeen = Object.keys(lastCheckedPrivateState).reduce(
    (acc, item) => acc + lastCheckedPrivateState[item],
    0,
  );
  const pendingPrivateNotification = totalPrivateMessage - totalPrivateLastSeen;

  React.useEffect(() => {
    const showMessageNotification = (data: any) => {
      if (data.type === messageActionType.Normal) {
        const {uid, msg} = data;
        Toast.show({
          type: 'success',
          text1: msg.length > 30 ? msg.slice(0, 30) + '...' : msg,
          text2: userList[uid]?.name ? fromText(userList[uid]?.name) : '',
          visibilityTime: 1000,
          onPress: () => {
            setSidePanel(SidePanelType.Chat);
            setLastCheckedPublicState(messageStore.length);
          },
        });
      }
    };
    events.on(
      messageChannelType.Public,
      'onPublicMessageReceived',
      (data: any, error: any) => {
        if (!data) return;
        showMessageNotification(data);
      },
    );
    events.on(
      messageChannelType.Private,
      'onPrivateMessageReceived',
      (data: any, error: any) => {
        if (!data) return;
        if (data.uid === localUid) return;
        showMessageNotification(data);
      },
    );
    return () => {
      // Cleanup the listeners
      events.off(messageChannelType.Public, 'onPublicMessageReceived');
      events.off(messageChannelType.Private, 'onPrivateMessageReceived');
    };
  }, [userList, messageStore]);

  return children({
    pendingPublicNotification,
    pendingPrivateNotification,
    lastCheckedPublicState,
    setLastCheckedPublicState,
    lastCheckedPrivateState,
    setLastCheckedPrivateState,
    privateMessageCountMap,
    setPrivateMessageLastSeen,
  });
};

const JOIN_CHANNEL_PHRASE_AND_GET_USER = gql`
  query JoinChannel($passphrase: String!) {
    joinChannel(passphrase: $passphrase) {
      channel
      title
      isHost
      secret
      mainUser {
        rtc
        rtm
        uid
      }
      screenShare {
        rtc
        rtm
        uid
      }
    }
    getUser {
      name
      email
    }
  }
`;

const JOIN_CHANNEL_PHRASE = gql`
  query JoinChannel($passphrase: String!) {
    joinChannel(passphrase: $passphrase) {
      channel
      title
      isHost
      secret
      mainUser {
        rtc
        rtm
        uid
      }
      screenShare {
        rtc
        rtm
        uid
      }
    }
  }
`;
enum RnEncryptionEnum {
  /**
   * @deprecated
   * 0: This mode is deprecated.
   */
  None = 0,
  /**
   * 1: (Default) 128-bit AES encryption, XTS mode.
   */
  AES128XTS = 1,
  /**
   * 2: 128-bit AES encryption, ECB mode.
   */
  AES128ECB = 2,
  /**
   * 3: 256-bit AES encryption, XTS mode.
   */
  AES256XTS = 3,
  /**
   * 4: 128-bit SM4 encryption, ECB mode.
   *
   * @since v3.1.2.
   */
  SM4128ECB = 4,
}

const VideoCall: React.FC = () => {
  const {
    chat: ChatFPE,
    bottomBar,
    participantsPanel,
    settingsPanel,
    topBar,
  } = useFpe((data) =>
    data?.components?.videoCall &&
    typeof data?.components?.videoCall === 'object'
      ? data.components?.videoCall
      : {},
  );
  const chat =
    typeof ChatFPE !== 'object' ? isValidElementType(ChatFPE) : undefined;
  const PreCallScreenFpe = useFpe((data) =>
    typeof data?.components?.precall !== 'object'
      ? isValidElementType(data?.components?.precall)
      : undefined,
  );
  const {setGlobalErrorMessage} = useContext(ErrorContext);
  const {store, setStore} = useContext(StorageContext);
  const getInitialUsername = () =>
    store?.displayName ? store.displayName : '';
  const [username, setUsername] = useState(getInitialUsername);
  const [participantsView, setParticipantsView] = useState(false);
  const [callActive, setCallActive] = useState($config.PRECALL ? false : true);
  const [layout, setLayout] = useState(Layout.Grid);
  const [recordingActive, setRecordingActive] = useState(false);
  const [chatDisplayed, setChatDisplayed] = useState(false);
  const [queryComplete, setQueryComplete] = useState(false);
  const [sidePanel, setSidePanel] = useState<SidePanelType>(SidePanelType.None);
  const [isPrivateChatDisplayed, setPrivateChatDisplayed] = useState(false);
  const {phrase} = useParams();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isHost, setIsHost] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const lifecycle = useFpe((data) => data.lifecycle);
  const [rtcProps, setRtcProps] = React.useState({
    appId: $config.APP_ID,
    channel: null,
    uid: null,
    token: null,
    rtm: null,
    screenShareUid: null,
    screenShareToken: null,
    profile: $config.PROFILE,
    dual: true,
    encryption: $config.ENCRYPTION_ENABLED
      ? {key: null, mode: RnEncryptionEnum.AES128XTS, screenKey: null}
      : false,
    role: ClientRole.Broadcaster,
  });

  const {data, loading, error} = useQuery(
    store.token === null
      ? JOIN_CHANNEL_PHRASE
      : JOIN_CHANNEL_PHRASE_AND_GET_USER,
    {
      variables: {passphrase: phrase},
    },
  );

  const fpeLayouts = useCustomLayout();

  React.useEffect(() => {
    if (error) {
      console.log('error', error);
      // console.log('error data', data);
      if (!errorMessage) {
        setGlobalErrorMessage && setGlobalErrorMessage(error);
        queryComplete ? {} : setQueryComplete(true);
      }
      return;
    }

    if (!loading && data) {
      console.log('token:', rtcProps.token);
      console.log('error', data.error);
      setRtcProps({
        appId: $config.APP_ID,
        channel: data.joinChannel.channel,
        uid: data.joinChannel.mainUser.uid,
        token: data.joinChannel.mainUser.rtc,
        rtm: data.joinChannel.mainUser.rtm,
        dual: true,
        profile: $config.PROFILE,
        encryption: $config.ENCRYPTION_ENABLED
          ? {
              key: data.joinChannel.secret,
              mode: RnEncryptionEnum.AES128XTS,
              screenKey: data.joinChannel.secret,
            }
          : false,
        screenShareUid: data.joinChannel.screenShare.uid,
        screenShareToken: data.joinChannel.screenShare.rtc,
        role: data.joinChannel.isHost
          ? ClientRole.Broadcaster
          : ClientRole.Audience,
      });
      setIsHost(data.joinChannel.isHost);
      setTitle(data.joinChannel.title);

      console.log('query done: ', data, queryComplete);
      // 1. Store the display name from API
      if (data.getUser) {
        setUsername(data.getUser.name);
      }
      console.log('token:', rtcProps.token);
      queryComplete ? {} : setQueryComplete(true);
    }
  }, [error, loading, data]);

  const history = useHistory();
  const callbacks = {
    EndCall: () =>
      setTimeout(() => {
        history.push('/');
      }, 0),
  };

  React.useEffect(() => {
    // Update the username in localstorage when username changes
    if (setStore) {
      setStore((prevState) => {
        return {
          ...prevState,
          token: store?.token || null,
          displayName: username,
        };
      });
    }
  }, [username]);

  return (
    <>
      {queryComplete ? (
        queryComplete || !callActive ? (
          <>
            <PropsProvider
              value={{
                rtcProps: {
                  ...rtcProps,
                  callActive,
                  lifecycle,
                },
                callbacks,
                styleProps,
                mode: $config.EVENT_MODE
                  ? ChannelProfile.LiveBroadcasting
                  : ChannelProfile.Communication,
              }}>
              <RtcConfigure>
                <DeviceConfigure userRole={rtcProps.role}>
                  <RtmConfigure
                    setRecordingActive={setRecordingActive}
                    name={username}
                    callActive={callActive}>
                    <ScreenshareConfigure>
                      <LiveStreamContextProvider
                        setRtcProps={setRtcProps}
                        isHost={isHost}>
                        {callActive ? (
                          <View style={style.full}>
                            <NotificationControl
                              setSidePanel={setSidePanel}
                              chatDisplayed={sidePanel === SidePanelType.Chat}
                              isPrivateChatDisplayed={isPrivateChatDisplayed}>
                              {({
                                pendingPublicNotification,
                                pendingPrivateNotification,
                                setLastCheckedPublicState,
                                lastCheckedPublicState,
                                lastCheckedPrivateState,
                                setLastCheckedPrivateState,
                                privateMessageCountMap,
                                setPrivateMessageLastSeen,
                              }) => (
                                <VideoCallProvider
                                  value={{
                                    sidePanel,
                                    setSidePanel,
                                    layout,
                                    setLayout,
                                    recordingActive,
                                    setRecordingActive,
                                    isHost,
                                    title,
                                  }}>
                                  <ChatUIDataProvider
                                    privateMessageCountMap={
                                      privateMessageCountMap
                                    }
                                    pendingPublicNotification={
                                      pendingPublicNotification
                                    }
                                    pendingPrivateNotification={
                                      pendingPrivateNotification
                                    }
                                    lastCheckedPrivateState={
                                      lastCheckedPrivateState
                                    }
                                    pendingMessageLength={
                                      pendingPublicNotification +
                                      pendingPrivateNotification
                                    }
                                    setLastCheckedPublicState={
                                      setLastCheckedPublicState
                                    }
                                    setPrivateMessageLastSeen={
                                      setPrivateMessageLastSeen
                                    }
                                    setPrivateChatDisplayed={
                                      setPrivateChatDisplayed
                                    }>
                                    {cmpTypeGuard(Navbar, topBar)}
                                    <View
                                      style={[
                                        style.videoView,
                                        {backgroundColor: '#ffffff00'},
                                      ]}>
                                      <CustomUserContextHolder>
                                        <NetworkQualityProvider>
                                          <VideoArrayRenderer>
                                            {(
                                              minVideoArray: React.FC[],
                                              maxVideoArray: React.FC[],
                                            ) => {
                                              if (
                                                fpeLayouts &&
                                                fpeLayouts[layout] &&
                                                typeof fpeLayouts[layout]
                                                  .component === 'function'
                                              ) {
                                                const CurrentLayout =
                                                  fpeLayouts[layout].component;
                                                return (
                                                  <CurrentLayout
                                                    minVideoArray={
                                                      minVideoArray
                                                    }
                                                    maxVideoArray={
                                                      maxVideoArray
                                                    }
                                                  />
                                                );
                                              } else {
                                                return <></>;
                                              }
                                            }}
                                          </VideoArrayRenderer>
                                          {sidePanel ===
                                          SidePanelType.Participants ? (
                                            cmpTypeGuard(
                                              ParticipantsView,
                                              participantsPanel,
                                            )
                                          ) : (
                                            <></>
                                          )}
                                        </NetworkQualityProvider>
                                        {sidePanel === SidePanelType.Chat ? (
                                          $config.CHAT ? (
                                            cmpTypeGuard(Chat, chat)
                                          ) : (
                                            <></>
                                          )
                                        ) : (
                                          <></>
                                        )}
                                        {sidePanel ===
                                        SidePanelType.Settings ? (
                                          cmpTypeGuard(
                                            SettingsView,
                                            settingsPanel,
                                          )
                                        ) : (
                                          <></>
                                        )}
                                      </CustomUserContextHolder>
                                    </View>
                                    {!isWeb &&
                                    sidePanel === SidePanelType.Chat ? (
                                      <></>
                                    ) : (
                                      cmpTypeGuard(Controls, bottomBar)
                                    )}
                                  </ChatUIDataProvider>
                                </VideoCallProvider>
                              )}
                            </NotificationControl>
                          </View>
                        ) : $config.PRECALL ? (
                          <PreCallProvider
                            value={{
                              username,
                              setUsername,
                              callActive,
                              setCallActive,
                              queryComplete,
                              title,
                              error,
                            }}>
                            {cmpTypeGuard(Precall, PreCallScreenFpe)}
                          </PreCallProvider>
                        ) : (
                          <></>
                        )}
                      </LiveStreamContextProvider>
                    </ScreenshareConfigure>
                  </RtmConfigure>
                </DeviceConfigure>
              </RtcConfigure>
            </PropsProvider>
          </>
        ) : (
          <View style={style.loader}>
            <View style={style.loaderLogo}>{hasBrandLogo && <Logo />}</View>
            <Text style={style.loaderText}>
              {useString('joiningLoaderLabel')()}
            </Text>
          </View>
        )
      ) : (
        <></>
      )}
    </>
  );
};

const styleProps = {
  maxViewStyles: styles.temp,
  minViewStyles: styles.temp,
  localBtnContainer: styles.bottomBar,
  localBtnStyles: {
    muteLocalAudio: styles.localButton,
    muteLocalVideo: styles.localButton,
    switchCamera: styles.localButton,
    endCall: styles.endCall,
    fullScreen: styles.localButton,
    recording: styles.localButton,
    screenshare: styles.localButton,
  },
  theme: $config.PRIMARY_COLOR,
  remoteBtnStyles: {
    muteRemoteAudio: styles.remoteButton,
    muteRemoteVideo: styles.remoteButton,
    remoteSwap: styles.remoteButton,
    minCloseBtnStyles: styles.minCloseBtn,
    liveStreamHostControlBtns: styles.liveStreamHostControlBtns,
  },
  BtnStyles: styles.remoteButton,
};
//change these to inline styles or sth
const style = StyleSheet.create({
  full: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  videoView: videoView,
  loader: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  loaderLogo: {
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  loaderText: {fontWeight: '500', color: $config.PRIMARY_FONT_COLOR},
});

export default VideoCall;

import React, {useState, useContext} from 'react';
import {View, StyleSheet, Text, Platform} from 'react-native';
import RtcConfigure from '../../agora-rn-uikit/src/RTCConfigure';
import {PropsProvider} from '../../agora-rn-uikit/src/PropsContext';
import Navbar from '../components/Navbar';
import Precall from '../components/Precall';
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
// import Watermark from '../subComponents/Watermark';
import StorageContext from '../components/StorageContext';
import Logo from '../subComponents/Logo';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {videoView} from '../../theme.json';

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

const VideoCall: React.FC = () => {
  const {store} = useContext(StorageContext);
  const [username, setUsername] = useState('Getting name...');
  const [participantsView, setParticipantsView] = useState(false);
  const [callActive, setCallActive] = useState($config.precall ? false : true);
  const [layout, setLayout] = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);
  const [chatDisplayed, setChatDisplayed] = useState(false);
  const [queryComplete, setQueryComplete] = useState(false);
  const [sidePanel, setSidePanel] = useState<SidePanelType>(SidePanelType.None);
  const {phrase} = useParams();
  const [errorMessage, setErrorMessage] = useState(null);
  let isHost = true; //change to false by default after testing
  let title = null;
  let rtcProps = {
    appId: $config.AppID,
    channel: null,
    uid: null,
    token: null,
    rtm: null,
    screenShareUid: null,
    screenShareToken: null,
    profile: '480p_9',
    dual: true,
    encryption: $config.encryption
      ? {key: null, mode: 'aes-128-xts', screenKey: null}
      : false,
  };
  let data, loading, error;

  ({data, loading, error} = useQuery(
    store.token === null
      ? JOIN_CHANNEL_PHRASE
      : JOIN_CHANNEL_PHRASE_AND_GET_USER,
    {
      variables: {passphrase: phrase},
    },
  ));

  if (error) {
    console.log('error', error);
    // console.log('error data', data);
    if (!errorMessage) {
      setErrorMessage(error);
    }
  }

  if (!loading && data) {
    console.log('token:', rtcProps.token);
    console.log('error', data.error);
    rtcProps = {
      appId: $config.AppID,
      channel: data.joinChannel.channel,
      uid: data.joinChannel.mainUser.uid,
      token: data.joinChannel.mainUser.rtc,
      rtm: data.joinChannel.mainUser.rtm,
      dual: true,
      profile: $config.profile,
      encryption: $config.encryption
        ? {
            key: data.joinChannel.secret,
            mode: 'aes-128-xts',
            screenKey: data.joinChannel.secret,
          }
        : false,
      screenShareUid: data.joinChannel.screenShare.uid,
      screenShareToken: data.joinChannel.screenShare.rtc,
    };
    isHost = data.joinChannel.isHost;
    title = data.joinChannel.title;
    console.log('query done: ', data, queryComplete);
    if (username === 'Getting name...') {
      if (data.getUser) {
        setUsername(data.getUser.name);
      } else {
        setUsername('');
      }
    }
    console.log('token:', rtcProps.token);
    queryComplete ? {} : setQueryComplete(true);
  }

  const history = useHistory();
  const callbacks = {
    EndCall: () => history.push('/'),
  };

  return (
    <>
      {queryComplete || !callActive ? (
        <>
          {/* {$config.watermark && callActive ? <Watermark /> : <></>} */}
          <PropsProvider
            value={{
              rtcProps,
              callbacks,
              styleProps,
            }}>
            <RtcConfigure callActive={callActive}>
              <DeviceConfigure>
                <RtmConfigure
                  setRecordingActive={setRecordingActive}
                  name={username}
                  callActive={callActive}>
                  {callActive ? (
                    <View style={style.full}>
                      <Navbar
                        // participantsView={participantsView}
                        // setParticipantsView={setParticipantsView}
                        sidePanel={sidePanel}
                        setSidePanel={setSidePanel}
                        // chatDisplayed={chatDisplayed}
                        // setChatDisplayed={setChatDisplayed}
                        layout={layout}
                        setLayout={setLayout}
                        recordingActive={recordingActive}
                        setRecordingActive={setRecordingActive}
                        isHost={isHost}
                        title={title}
                      />
                      <View style={style.videoView}>
                        {layout ? <PinnedVideo /> : <GridVideo />}
                        {sidePanel === SidePanelType.Participants ? (
                          <ParticipantsView
                            isHost={isHost}
                            // setParticipantsView={setParticipantsView}
                            setSidePanel={setSidePanel}
                          />
                        ) : (
                          <></>
                        )}
                        {sidePanel === SidePanelType.Chat ? (
                          $config.chat ? (
                            <Chat />
                          ) : (
                            <></>
                          )
                        ) : (
                          <></>
                        )}
                        {sidePanel === SidePanelType.Settings ? (
                          <SettingsView
                            isHost={isHost}
                            // setParticipantsView={setParticipantsView}
                            setSidePanel={setSidePanel}
                          />
                        ) : (
                          <></>
                        )}
                      </View>
                      {Platform.OS !== 'web' &&
                      sidePanel === SidePanelType.Chat ? (
                        <></>
                      ) : (
                        <Controls
                          recordingActive={recordingActive}
                          setRecordingActive={setRecordingActive}
                          // chatDisplayed={chatDisplayed}
                          // setChatDisplayed={setChatDisplayed}
                          isHost={isHost}
                          // participantsView={participantsView}
                          // setParticipantsView={setParticipantsView}
                          sidePanel={sidePanel}
                          setSidePanel={setSidePanel}
                        />
                      )}
                    </View>
                  ) : $config.precall ? (
                    <Precall
                      error={errorMessage}
                      username={username}
                      setUsername={setUsername}
                      setCallActive={setCallActive}
                      queryComplete={queryComplete}
                    />
                  ) : (
                    <></>
                  )}
                </RtmConfigure>
              </DeviceConfigure>
            </RtcConfigure>
          </PropsProvider>
        </>
      ) : (
        <View style={style.loader}>
          <View style={style.loaderLogo}>
            <Logo />
          </View>
          <Text style={style.loaderText}>Starting Call. Just a second.</Text>
        </View>
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
  theme: $config.primaryColor,
  remoteBtnStyles: {
    muteRemoteAudio: styles.remoteButton,
    muteRemoteVideo: styles.remoteButton,
    remoteSwap: styles.remoteButton,
    minCloseBtnStyles: styles.minCloseBtn,
  },
  BtnStyles: styles.remoteButton,
};
//change these to inline styles or sth
const style = StyleSheet.create({
  full: {
    flex: 1,
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
  loaderText: {fontWeight: '500'},
});

export default VideoCall;

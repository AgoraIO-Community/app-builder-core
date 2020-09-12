import React, {useState, useContext, useEffect} from 'react';
import {View, Platform} from 'react-native';
import {MaxVideoView} from '../../agora-rn-uikit/Components';
import RtcConfigure from '../../agora-rn-uikit/src/RTCConfigure';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';
import {PropsProvider} from '../../agora-rn-uikit/src/PropsContext';
import Navbar from '../components/Navbar';
import Precall from '../components/Precall';
import ParticipantsView from '../components/ParticipantsView';
import PinnedVideo from '../components/PinnedVideo';
import ParticipantCounter from '../components/ParticipantCounter';
import Controls from '../components/Controls';
import GridVideo from '../components/GridVideo';
import styles from '../components/styles';
import {useParams, useHistory} from '../components/Router';
import Chat from '../components/Chat';
import RtmConfigure from '../components/RTMConfigure';
import HostControlView from '../components/HostControlView';
import DeviceConfigure from '../components/DeviceConfigure';
import {gql, useQuery} from '@apollo/client';
import SessionContext from '../components/SessionContext';

const JOIN_CHANNEL = gql`
  query JoinChannel($channel: String!, $password: String!) {
    joinChannel(channel: $channel, password: $password) {
      channel
      isHost
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

const JOIN_CHANNEL_PHRASE = gql`
  query JoinChannelWithPassphrase($passphrase: String!) {
    joinChannelWithPassphrase(passphrase: $passphrase) {
      channel
      isHost
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
  const [participantsView, setParticipantsView] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [layout, setLayout] = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);
  const [chatDisplayed, setChatDisplayed] = useState(false);
  const [hostControlView, setHostControlView] = useState(false);
  const [queryComplete, setQueryComplete] = useState(false);
  const {joinStore} = useContext(SessionContext);
  // const {channel, password, joinFlag, phrase} = joinStore;
  //remove me and uncomment the above
  const channel = 'neu',
    password = 'pass',
    joinFlag = 0;
  //done
  let isHost = true;
  let rtcProps = {
    appId: 'b8c2ef0f986541a8992451c07d30fb4b',
    channel: null,
    uid: null,
    token: null,
    rtm: null,
    screenShareUid: null,
    screenShareToken: null,
    dual: true,
  };
  let data, loading, error;

  joinFlag === 0
    ? ({data, loading, error} = useQuery(JOIN_CHANNEL, {
        variables: {channel, password},
      }))
    : ({data, loading, error} = useQuery(JOIN_CHANNEL_PHRASE, {
        variables: {passphrase: phrase},
      }));

  if (!loading && data) {
    // console.log('in query:', data);
    if (joinFlag === 0) {
      rtcProps = {
        appId: 'b8c2ef0f986541a8992451c07d30fb4b',
        channel: data.joinChannel.channel,
        uid: data.joinChannel.mainUser.uid,
        token: data.joinChannel.mainUser.rtc,
        rtm: data.joinChannel.mainUser.rtm,
        dual: true,
        screenShareUid: data.joinChannel.screenShare.uid,
        screenShareToken: data.joinChannel.screenShare.rtc,
      };
      isHost = data.joinChannel.isHost;
    }
    if (joinFlag === 1) {
      rtcProps = {
        appId: 'b8c2ef0f986541a8992451c07d30fb4b',
        channel: data.joinChannelWithPassphrase.channel,
        uid: data.joinChannelWithPassphrase.mainUser.uid,
        token: data.joinChannelWithPassphrase.mainUser.rtc,
        rtm: data.joinChannelWithPassphrase.mainUser.rtm,
        dual: true,
        screenShareUid: data.joinChannelWithPassphrase.screenShare.uid,
        screenShareToken: data.joinChannelWithPassphrase.screenShare.rtc,
      };
      isHost = data.joinChannelWithPassphrase.isHost;
    }
    console.log('query done: ', data, queryComplete);
    queryComplete ? {} : setQueryComplete(true);
  }

  const history = useHistory();
  const callbacks = {
    EndCall: () => history.push('/'),
  };

  return (
    <>
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
              callActive={callActive}>
              {callActive ? (
                <View style={styles.full}>
                  <Navbar
                    participantsView={participantsView}
                    setParticipantsView={setParticipantsView}
                    chatDisplayed={chatDisplayed}
                    setChatDisplayed={setChatDisplayed}
                    hostControlView={hostControlView}
                    setHostControlView={setHostControlView}
                    layout={layout}
                    setLayout={setLayout}
                    recordingActive={recordingActive}
                    setRecordingActive={setRecordingActive}
                    isHost={isHost}
                  />
                  <View style={styles.videoView}>
                    {participantsView ? (
                      <ParticipantsView isHost={isHost} />
                    ) : (
                      <></>
                    )}
                    {/* {hostControlView ? <HostControlView /> : <></>} */}
                    {layout ? <PinnedVideo /> : <GridVideo />}
                  </View>
                  <Controls
                    recordingActive={recordingActive}
                    setRecordingActive={setRecordingActive}
                    chatDisplayed={chatDisplayed}
                    setChatDisplayed={setChatDisplayed}
                    isHost={isHost}
                  />
                  {chatDisplayed ? <Chat /> : <></>}
                </View>
              ) : (
                <Precall
                  setCallActive={setCallActive}
                  queryComplete={queryComplete}
                />
              )}
            </RtmConfigure>
          </DeviceConfigure>
        </RtcConfigure>
      </PropsProvider>
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
  theme: '#099DFD',
  remoteBtnStyles: {
    muteRemoteAudio: styles.remoteButton,
    muteRemoteVideo: styles.remoteButton,
    remoteSwap: styles.remoteButton,
    minCloseBtnStyles: styles.minCloseBtn,
  },
  BtnStyles: styles.remoteButton,
};

export default VideoCall;

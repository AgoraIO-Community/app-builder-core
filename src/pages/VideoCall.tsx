import React, {useState, useContext, useEffect} from 'react';
import {View, StatusBar, Platform} from 'react-native';
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
      rtc
      rtm
      uid
    }
  }
`;

const JOIN_CHANNEL_PHRASE = gql`
  query JoinChannelWithPassphrase($passphrase: String!) {
    joinChannelWithPassphrase(passphrase: $passphrase) {
      channel
      isHost
      rtc
      rtm
      uid
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
  const {channel, password, joinFlag, phrase} = joinStore;
  let isHost = false;
  let rtcProps = {
    appId: 'b8c2ef0f986541a8992451c07d30fb4b',
    channel: null,
    uid: null,
    token: null,
    rtm: null,
  };
  let data, loading, error;

  joinFlag === 0
    ? ({data, loading, error} = useQuery(JOIN_CHANNEL, {
        variables: {channel, password},
      }))
    : ({data, loading, error} = useQuery(JOIN_CHANNEL_PHRASE, {
        variables: {passphrase: phrase},
      }));

  setTimeout(() => {
    console.log({data}, {loading}, {error});
  }, 500);

  if (!loading && data) {
    console.log('in query:', data);
    if (joinFlag === 0) {
      rtcProps = {
        appId: 'b8c2ef0f986541a8992451c07d30fb4b',
        channel: data.joinChannel.channel,
        uid: data.joinChannel.uid,
        token: data.joinChannel.rtc,
        rtm: data.joinChannel.rtm,
      };
      isHost = data.joinChannel.isHost;
    }
    if (joinFlag === 1) {
      rtcProps = {
        appId: 'b8c2ef0f986541a8992451c07d30fb4b',
        channel: data.joinChannelWithPassphrase.channel,
        uid: data.joinChannelWithPassphrase.uid,
        token: data.joinChannelWithPassphrase.rtc,
        rtm: data.joinChannelWithPassphrase.rtm,
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
    <View style={styles.main}>
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
              <StatusBar hidden />
              {callActive ? (
                <View style={styles.full}>
                  <Navbar
                    participantsView={participantsView}
                    setParticipantsView={setParticipantsView}
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
                    {hostControlView ? <HostControlView /> : <></>}
                    {layout ? (
                      <View style={styles.full}>
                        {Platform.OS !== 'web' ? (
                          <></>
                        ) : (
                          <View style={styles.pinnedView}>
                            <PinnedVideo />
                          </View>
                        )}
                        <View style={styles.videoViewInner}>
                          <View style={styles.full}>
                            <MaxUidConsumer>
                              {(maxUsers) => (
                                <MaxVideoView
                                  user={maxUsers[0]}
                                  key={maxUsers[0].uid}
                                />
                              )}
                            </MaxUidConsumer>
                          </View>
                        </View>
                        {Platform.OS === 'web' ? (
                          <></>
                        ) : (
                          <View style={styles.pinnedView}>
                            <ParticipantCounter />
                            <PinnedVideo />
                          </View>
                        )}
                      </View>
                    ) : (
                      <GridVideo />
                    )}
                  </View>
                  <Controls
                    channelName={rtcProps.channel}
                    appId={rtcProps.appId}
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
    </View>
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
  remoteBtnStyles: {
    muteRemoteAudio: styles.remoteButton,
    muteRemoteVideo: styles.remoteButton,
    remoteSwap: styles.remoteButton,
    minCloseBtnStyles: styles.minCloseBtn,
  },
  BtnStyles: styles.remoteButton,
};

export default VideoCall;

import React, {useState} from 'react';
import {View, StatusBar, Platform} from 'react-native';
import {MaxVideoView} from './agora-rn-uikit/Components';
import RtcConfigure from './agora-rn-uikit/src/RTCConfigure';
import {MinUidConsumer} from './agora-rn-uikit/src/MinUidContext';
import {MaxUidConsumer} from './agora-rn-uikit/src/MaxUidContext';
import {PropsProvider, PropsInterface} from './agora-rn-uikit/src/PropsContext';
import JoinCall from './components/JoinCall';
import Navbar from './components/Navbar';
import ParticipantsView from './components/ParticipantsView';
import PinnedVideo from './components/PinnedVideo';
import ParticipantCounter from './components/ParticipantCounter';
import Controls from './components/Controls';
import styles from './components/styles';

const App: React.FC<PropsInterface> = () => {
  const [channel, onChangeChannel] = useState();
  const [password, onChangePassword] = useState();
  const [joinCall, setJoinCall] = useState(true);
  const [participantsView, setParticipantsView] = useState(false);
  const [layout, setLayout] = useState(false);
  const rtcProps = {
    appId: '9383ec2f56364d478cefc38b0a37d8bc',
    channel: channel,
  };
  const callbacks = {
    EndCall: () => setJoinCall(true),
  };
  const startCall = () => {
    rtcProps.channel = channel;
    setJoinCall(false);
  };

  return joinCall ? (
    <JoinCall
      channel={channel}
      onChangeChannel={onChangeChannel}
      password={password}
      onChangePassword={onChangePassword}
      startCall={startCall}
    />
  ) : (
    <View style={styles.main}>
      <PropsProvider value={{rtcProps, callbacks, styleProps}}>
        <RtcConfigure>
          <StatusBar hidden />
          <Navbar
            participantsView={participantsView}
            setParticipantsView={setParticipantsView}
            layout={layout}
            setLayout={setLayout}
          />
          <View style={styles.videoView}>
            {participantsView ? <ParticipantsView /> : <></>}
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
              <View style={styles.gridView}>
                <MaxUidConsumer>
                  {(maxUsers) => (
                    <View style={styles.full}>
                      <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
                    </View>
                  )}
                </MaxUidConsumer>
                <MinUidConsumer>
                  {(minUsers) =>
                    minUsers.map((user) => (
                      <View style={styles.full} key={user.uid}>
                        <MaxVideoView user={user} key={user.uid} />
                      </View>
                    ))
                  }
                </MinUidConsumer>
              </View>
            )}
          </View>
          <Controls />
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

export default App;

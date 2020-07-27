import React, {useState} from 'react';
import {View, StatusBar, Platform} from 'react-native';
import {MaxVideoView} from '../../agora-rn-uikit/Components';
import RtcConfigure from '../../agora-rn-uikit/src/RTCConfigure';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';
import {PropsProvider} from '../../agora-rn-uikit/src/PropsContext';
import Navbar from '../components/Navbar';
import ParticipantsView from '../components/ParticipantsView';
import PinnedVideo from '../components/PinnedVideo';
import ParticipantCounter from '../components/ParticipantCounter';
import Controls from '../components/Controls';
import GridVideo from '../components/GridVideo';
import styles from '../components/styles';
import {useParams, useHistory} from '../components/Router';
import Chat from '../components/Chat';

const VideoCall: React.FC = () => {
  const [participantsView, setParticipantsView] = useState(false);
  const [layout, setLayout] = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);
  const [chatDisplayed, setChatDisplayed] = useState(true);
  const {channel} = useParams();
  const rtcProps = {
    appId: '5c2412e4b1dd4ac89db273c928e29b4d',
    channel,
  };
  const history = useHistory();
  const callbacks = {
    EndCall: () => history.push('/'),
  };

  return (
    <View style={styles.main}>
      <PropsProvider value={{rtcProps, callbacks, styleProps}}>
        <RtcConfigure>
          <StatusBar hidden />
          <Navbar
            participantsView={participantsView}
            setParticipantsView={setParticipantsView}
            layout={layout}
            setLayout={setLayout}
            recordingActive={recordingActive}
            setRecordingActive={setRecordingActive}
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
          />
          {chatDisplayed ? <Chat /> : <></>}
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

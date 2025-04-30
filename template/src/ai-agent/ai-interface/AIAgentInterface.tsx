import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  CustomAgentInterfaceProps,
  useContent,
  useLocalAudio,
} from 'customization-api';
import {View, StyleSheet, Platform, Text} from 'react-native';
import ThemeConfig from '../../theme';
import {isAndroid, isIOS, isMobileUA} from '../../utils/common';
import {AgentContext} from '../components/AgentControls/AgentContext';

const NotJoinedMp4 = require('./1.Not-Joined.mp4').default;
const JoiningMp4 = require('./2.Joining.mp4').default;
const ListeningMp4 = require('./4.Listening.mp4').default;
const TalkingMp4 = require('./5.Talking.mp4').default;
const DisconnectingMp4 = require('./6.Disconnected.mp4').default;

const AI_ANIMATION_VIDEO = {
  NOT_JOINED: NotJoinedMp4,
  JOINING: JoiningMp4,
  LISTENING: ListeningMp4,
  TALKING: TalkingMp4,
  DISCONNECTING: DisconnectingMp4,
};

const cssHideVideoControls = `
video {
  -webkit-appearance: none; /* Remove default styling */
}
video::-webkit-media-controls {
  display: none !important; /* Hide the controls */
}
video::-webkit-media-controls-enclosure {
  display:none !important;
}`;

export default function AiAgentCustomView({
  connectionState,
}: CustomAgentInterfaceProps) {
  const [animation, setAnimation] =
    useState<keyof typeof AI_ANIMATION_VIDEO>('NOT_JOINED');
  const {activeUids} = useContent();
  const {agentUID} = useContext(AgentContext);
  const {getRemoteAudioStream} = useLocalAudio();
  const [isAISpeaking, setAISpeaking] = useState(false);
  const aiMediaStream = useRef(null);

  useEffect(() => {
    if (
      activeUids?.indexOf(agentUID) !== -1 &&
      !aiMediaStream?.current &&
      !(isAndroid() || isIOS())
    ) {
      const track = getRemoteAudioStream(agentUID);
      if (track) {
        const hark = require('hark');
        try {
          if (!aiMediaStream?.current) {
            aiMediaStream.current = new MediaStream([
              track.getMediaStreamTrack(),
            ]);
          }
          const harkai = hark(aiMediaStream?.current, {
            interval: 100,
          });
          harkai.on('speaking', () => {
            setAISpeaking(true);
          });
          harkai.on('stopped_speaking', () => {
            setAISpeaking(false);
          });
        } catch (error) {
          console.error('Debugging error on detecting AI speaking or not');
        }
      }
    }
  }, [activeUids, agentUID, isAISpeaking, connectionState]);

  useEffect(() => {
    if (isAISpeaking) {
      animation !== 'TALKING' && setAnimation('TALKING');
    } else {
      if (
        connectionState === 'NOT_CONNECTED' ||
        connectionState === 'AGENT_REQUEST_FAILED'
      ) {
        animation !== 'NOT_JOINED' && setAnimation('NOT_JOINED');
      } else if (
        connectionState === 'REQUEST_SENT' ||
        connectionState === 'AWAITING_JOIN'
      ) {
        animation !== 'JOINING' && setAnimation('JOINING');
      } else if (
        connectionState === 'AGENT_DISCONNECT_REQUEST' ||
        connectionState === 'AWAITING_LEAVE'
      ) {
        animation !== 'DISCONNECTING' && setAnimation('DISCONNECTING');
      } else if (
        connectionState === 'AGENT_CONNECTED' ||
        connectionState === 'AGENT_DISCONNECT_FAILED'
      ) {
        animation !== 'LISTENING' && setAnimation('LISTENING');
      }
    }
  }, [connectionState, animation, isAISpeaking]);
  return (
    <View style={styles.container}>
      {isAndroid() || isIOS() ? (
        <View style={styles.nativeTextContainer}>
          <Text style={styles.nativeText}>AI Agent...</Text>
        </View>
      ) : (
        <div style={styles.videoContainer}>
          <style type="text/css">{cssHideVideoControls}</style>
          <video
            disablePictureInPicture
            playsInline
            id="animation-video"
            autoPlay
            style={{pointerEvents: 'none'}}
            loop
            src={AI_ANIMATION_VIDEO[animation]}
            width={isMobileUA() ? '40%' : 'auto'}
            height={'auto'}
          />
          <div style={styles.overlay} />
        </div>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  nativeTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nativeText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 18,
    fontWeight: '800',
    color: $config.FONT_COLOR,
  },
  container: {
    flex: 1,
    backgroundColor: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    ...Platform.select({
      web: {
        pointerEvents: 'none',
      },
    }),
  },
});

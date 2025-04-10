import React, {useEffect, useRef, useState} from 'react';
import {
  CustomAgentInterfaceProps,
  useAIAgent,
  useContent,
  useLocalAudio,
} from 'customization-api';
import {View, StyleSheet, Platform} from 'react-native';
import hark from 'hark';

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

export default function AiAgentCustomView({
  connectionState,
}: CustomAgentInterfaceProps) {
  const [animation, setAnimation] =
    useState<keyof typeof AI_ANIMATION_VIDEO>('NOT_JOINED');
  const {activeUids} = useContent();
  const {agentUID} = useAIAgent();
  const {getRemoteAudioStream} = useLocalAudio();
  const [isAISpeaking, setAISpeaking] = useState(false);
  const aiMediaStream = useRef(null);

  useEffect(() => {
    if (activeUids?.indexOf(agentUID) !== -1 && !aiMediaStream.current) {
      const track = getRemoteAudioStream(agentUID);
      if (track) {
        try {
          if (!aiMediaStream.current) {
            console.log('debugging creating MediaStream here');
            aiMediaStream.current = new MediaStream([
              track.getMediaStreamTrack(),
            ]);
          } else {
            console.log('debugging existing MediaStream used');
          }
          const harkai = hark(aiMediaStream.current, {
            interval: 100,
          });
          harkai.on('speaking', () => {
            console.log('debugging ai is speaking');
            setAISpeaking(true);
          });
          harkai.on('stopped_speaking', () => {
            console.log('debugging ai is not speaking');
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
      <video
        autoPlay
        style={{pointerEvents: 'none'}}
        loop
        src={AI_ANIMATION_VIDEO[animation]}
        width="40%"
        height="40%"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        pointerEvents: 'none',
      },
    }),
  },
});

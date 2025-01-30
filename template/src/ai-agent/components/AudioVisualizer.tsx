import React from 'react';
import {Text, View} from 'react-native';
import {LiveAudioVisualizer} from './react-audio-visualize';
import {DisconnectedIconDesktop, DisconnectedIconMobile} from './icons';
import {isMobileUA} from '../../utils/common';

export const DisconnectedView = ({isConnected}) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {/* big circle that covers the parent view */}
      {isMobileUA() ? <DisconnectedIconMobile /> : <DisconnectedIconDesktop />}
      <Text
        style={{
          color: '#B3B3B3',
          fontSize: 20,
          fontWeight: '400',
          marginTop: 20,
        }}>
        {isConnected ? '' : 'Not Joined'}
      </Text>
    </View>
  );
};

function createSilentAudioTrack(): MediaStreamTrack {
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const dst = audioContext.createMediaStreamDestination();
  oscillator.connect(dst);
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, {enabled: false});
}

const emptyAudioTrack = {
  getMediaStreamTrack: () => createSilentAudioTrack(),
  getVolumeLevel: () => 0,
  setVolume: () => {},
  setEnabled: () => {},
  play: () => {},
  stop: () => {},
  setPlaybackDevice: () => Promise.resolve(),
  getStats: () => ({
    receiveBytes: 0,
    receivePackets: 0,
    receivePacketsLost: 0,
    state: 'stopped',
  }),
  isPlaying: false,
  processTrack: {
    on: () => {},
    off: () => {},
  },
};

const AudioVisualizer = ({audioTrack}) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <LiveAudioVisualizer
        audioTrack={audioTrack || emptyAudioTrack}
        width={300}
        height={400}
        fftSize={32}
        barWidth={10}
        minDecibels={-60}
        maxDecibels={-10}
        gap={2}
        backgroundColor="transparent"
        barColor="#00C2FF"
        smoothingTimeConstant={0.9}
      />
    </View>
  );
};

export default AudioVisualizer;

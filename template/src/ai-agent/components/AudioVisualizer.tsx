import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {LiveAudioVisualizer} from './react-audio-visualize';
import ThemeConfig from '../../theme';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {isAndroid, isIOS, Spacer} from 'customization-api';

export const DisconnectedView = ({isConnected}) => {
  return (
    <View style={DisconnectedViewStyles.container}>
      <View style={DisconnectedViewStyles.circleView} />
      <Spacer size={16} />
      <Text style={DisconnectedViewStyles.textStyle}>
        {isConnected ? '' : 'Not Joined'}
      </Text>
    </View>
  );
};

const DisconnectedViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: $config.VIDEO_AUDIO_TILE_COLOR,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleView: {
    width: 210,
    height: 210,
    borderRadius: 210 / 2,
    borderWidth: 15,
    borderColor: $config.SEMANTIC_NEUTRAL,
  },
  textStyle: {
    color: $config.FONT_COLOR + hexadecimalTransparency['40%'],
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});

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
      {isAndroid() || isIOS() ? (
        <Text style={{color: $config.FONT_COLOR}}>Agent....</Text>
      ) : (
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
      )}
    </View>
  );
};

export default AudioVisualizer;

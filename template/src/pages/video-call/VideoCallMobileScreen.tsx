import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import VideoComponent from './VideoComponent';
import ActionSheet from './ActionSheet';

interface VideoCallMobileScreenProps {
  title: string;
}
const VideoCallMobileScreen = (props: VideoCallMobileScreenProps) => {
  const {title} = props;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.videoView}>
        <VideoComponent />
      </View>
      <ActionSheet />
    </View>
  );
};

export default VideoCallMobileScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flex: 1,
  },
  title: {
    fontSize: 16,
    lineHeight: 16,
    color: $config.PRIMARY_FONT_COLOR,
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
  },
  videoView: {
    flex: 0.8,
    backgroundColor: '#ffffff00',
    borderWidth: 1,
    borderColor: 'red',
  },
});

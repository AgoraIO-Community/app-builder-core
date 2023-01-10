import React from 'react';
import {useRecording} from '../../subComponents/recording/useRecording';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import VideoCallMobileView from './VideoCallMobileView';

interface VideoCallMobileScreenProps {
  title: string;
}
const VideoCallMobileScreen = (props: VideoCallMobileScreenProps) => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <VideoCallMobileView />
    </GestureHandlerRootView>
  );
};

export default VideoCallMobileScreen;

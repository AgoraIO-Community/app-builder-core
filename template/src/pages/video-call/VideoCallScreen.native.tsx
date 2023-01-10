import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import VideoCallMobileView from './VideoCallMobileView';

const VideoCallleScreen = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <VideoCallMobileView />
    </GestureHandlerRootView>
  );
};

export default VideoCallleScreen;

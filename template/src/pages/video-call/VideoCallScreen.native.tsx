import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import VideoCallMobileView from './VideoCallMobileView';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import {AppRegistry, Platform} from 'react-native';
// import {useRender} from 'customization-api';
// import {filterObject} from '../../utils';
// import {useScreenContext} from '../../components/contexts/ScreenShareContext';

const VideoCallleScreen = () => {
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      ReactNativeForegroundService.register();
      AppRegistry.registerComponent($config.APP_NAME, () => VideoCallleScreen);
      ReactNativeForegroundService.add_task(
        () => {
          //console.log('App is active!')
        },
        {
          delay: 1000,
          onLoop: true,
          taskId: 'taskid',
          onError: (e) => console.log(`Error logging:`, e),
        },
      );
      ReactNativeForegroundService.start({
        id: 145,
        title: $config.APP_NAME,
        message: 'Call is active',
      });
    }
  }, []);

  // const {isScreenShareOnFullView, screenShareData} = useScreenContext();
  // const {renderList} = useRender();
  // const maxScreenShareData = filterObject(
  //   screenShareData,
  //   ([k, v]) => v?.isExpanded === true,
  // );
  // const maxScreenShareUid = Object.keys(maxScreenShareData)?.length
  //   ? Object.keys(maxScreenShareData)[0]
  //   : null;

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <VideoCallMobileView />
    </GestureHandlerRootView>
  );
  // return isScreenShareOnFullView &&
  //   maxScreenShareUid &&
  //   renderList[maxScreenShareUid] &&
  //   renderList[maxScreenShareUid]?.video ? (
  //   <VideoCallMobileView />
  // ) : (
  //   <GestureHandlerRootView style={{flex: 1}}>
  //     <VideoCallMobileView />
  //   </GestureHandlerRootView>
  // );
};

export default VideoCallleScreen;

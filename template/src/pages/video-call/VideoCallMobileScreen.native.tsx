import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import VideoComponent from './VideoComponent';
import ActionSheet from './ActionSheet';
import ThemeConfig from '../../theme';
import Spacer from '../../atoms/Spacer';
import {useRecording} from '../../subComponents/recording/useRecording';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ParticipantsCount from '../../atoms/ParticipantsCount';
import RecordingInfo from '../../atoms/RecordingInfo';

interface VideoCallMobileScreenProps {
  title: string;
}
const VideoCallMobileScreen = (props: VideoCallMobileScreenProps) => {
  const {title} = props;
  const {isRecordingActive} = useRecording();
  const recordingLabel = 'Recording';
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <View style={styles.container}>
        <View style={styles.titleBar}>
          <Text style={styles.title}>{title}</Text>
          <Spacer size={8} horizontal={false} />
          <View style={styles.countView}>
            <View style={{width: 60, height: 42}}>
              <ParticipantsCount />
            </View>
            {isRecordingActive ? (
              <RecordingInfo recordingLabel={recordingLabel} />
            ) : null}
          </View>
          <View></View>
        </View>
        <Spacer size={40} />
        <View style={styles.videoView}>
          <VideoComponent />
        </View>
        <ActionSheet />
      </View>
    </GestureHandlerRootView>
  );
};

export default VideoCallMobileScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flex: 1,
  },
  title: {
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: ThemeConfig.FontSize.normal,
    color: $config.FONT_COLOR,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  videoView: {
    flex: 0.8,
  },
  titleBar: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  countView: {
    flexDirection: 'row',
  },
});

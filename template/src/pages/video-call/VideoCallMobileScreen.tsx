import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import VideoComponent from './VideoComponent';
import ActionSheet from './ActionSheet';
import ThemeConfig from '../../theme';
import Spacer from '../../atoms/Spacer';
import {useRecording} from '../../subComponents/recording/useRecording';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import ParticipantsCount from '../../atoms/ParticipantsCount';
interface VideoCallMobileScreenProps {
  title: string;
}
const VideoCallMobileScreen = (props: VideoCallMobileScreenProps) => {
  const {title} = props;
  const {isRecordingActive} = useRecording();
  const recordingLabel = 'Recording';
  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>{title}</Text>
        <Spacer size={8} horizontal={false} />
        <View style={styles.countView}>
          <ParticipantsCount />
          {isRecordingActive ? (
            <View style={[styles.recordingView]}>
              <View style={[styles.recordingStatus]} />
              <Text style={styles.recordingText}>{recordingLabel}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Spacer size={40} />
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

  recordingView: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FF414D' + hexadecimalTransparency['10%'],
    marginLeft: 20,
  },
  recordingText: {
    fontSize: 16,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
    color: '#ff414D',
  },
  recordingStatus: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#FF414D',
    marginRight: 8,
  },
});

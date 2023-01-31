import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import VideoComponent from './VideoComponent';
import ActionSheet from './ActionSheet';
import ThemeConfig from '../../theme';
import Spacer from '../../atoms/Spacer';
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';

import {useRecording} from '../../subComponents/recording/useRecording';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import ParticipantsCount from '../../atoms/ParticipantsCount';
import RecordingInfo from '../../atoms/RecordingInfo';
import {trimText} from '../../utils/common';

const VideoCallMobileView = () => {
  const {
    data: {meetingTitle},
  } = useMeetingInfo();
  const {isRecordingActive} = useRecording();
  const recordingLabel = 'Recording';
  return (
    <View style={styles.container}>
      <View style={styles.titleBar}>
        <Text style={styles.title}>{trimText(meetingTitle)}</Text>
        <Spacer size={8} horizontal={false} />
        <View style={styles.countView}>
          <View
            style={{
              width: 45,
              height: 35,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',

              //flex: 1,
            }}>
            <ParticipantsCount />
          </View>
          {isRecordingActive ? (
            <RecordingInfo recordingLabel={recordingLabel} />
          ) : (
            <></>
          )}
        </View>
      </View>
      <Spacer size={16} />
      <View style={styles.videoView}>
        <VideoComponent />
      </View>
      {/* <ActionSheet /> */}
    </View>
  );
};

export default VideoCallMobileView;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: ThemeConfig.FontSize.normal,
    color: $config.FONT_COLOR,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    paddingVertical: 2,
  },
  videoView: {
    flex: 12,
    flexDirection: 'row',
  },
  titleBar: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  countView: {
    flexDirection: 'row',
  },
});

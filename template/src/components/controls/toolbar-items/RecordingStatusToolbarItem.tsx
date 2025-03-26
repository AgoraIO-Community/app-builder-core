import React from 'react';
import {View} from 'react-native';
import ToolbarItem from '../../../atoms/ToolbarItem';
import RecordingInfo from '../../../atoms/RecordingInfo';
import {useString} from '../../../utils/useString';
import {useRecording} from '../../../subComponents/recording/useRecording';
import {videoRoomRecordingText} from '../../../language/default-labels/videoCallScreenLabels';
import {isWebInternal} from '../../../utils/common';

export const RecordingStatusToolbarItem = () => {
  const recordingLabel = useString(videoRoomRecordingText)(
    $config.RECORDING_MODE,
  );
  const {isRecordingActive} = useRecording();
  return isRecordingActive ? (
    <ToolbarItem>
      <View
        style={{
          width: 45,
          height: 35,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
          zIndex: isWebInternal() ? 3 : 0,
        }}>
        <RecordingInfo recordingLabel={recordingLabel} />
      </View>
    </ToolbarItem>
  ) : null;
};

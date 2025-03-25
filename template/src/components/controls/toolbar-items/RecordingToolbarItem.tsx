import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import Recording from '../../../subComponents/Recording';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export const RecordingToolbarItem = props => {
  const canStartRecording = useControlPermissionMatrix('startRecordingControl');
  return (
    canStartRecording && (
      <ToolbarItem testID="recording-btn" toolbarProps={props}>
        <Recording />
      </ToolbarItem>
    )
  );
};

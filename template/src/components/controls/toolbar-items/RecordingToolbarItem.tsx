import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import {useRoomInfo} from './../../room-info/useRoomInfo';
import Recording from '../../../subComponents/Recording';

export const RecordingToolbarItem = props => {
  const {
    data: {isHost},
  } = useRoomInfo();
  return (
    isHost &&
    $config.CLOUD_RECORDING && (
      <ToolbarItem testID="recording-btn" toolbarProps={props}>
        <Recording />
      </ToolbarItem>
    )
  );
};

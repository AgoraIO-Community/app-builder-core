import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import LocalVideoMute from '../../../subComponents/LocalVideoMute';

export const LocalVideoToolbarItem = props => {
  return (
    !$config.AUDIO_ROOM && (
      <ToolbarItem testID="localVideo-btn" toolbarProps={props}>
        <LocalVideoMute showToolTip={true} />
      </ToolbarItem>
    )
  );
};

import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import LocalAudioMute from '../../../subComponents/LocalAudioMute';

export const LocalAudioToolbarItem = props => {
  return (
    <ToolbarItem testID="localAudio-btn" toolbarProps={props}>
      <LocalAudioMute
        showToolTip={true}
        iconBGColor={props?.iconBGColor}
        iconSize={props?.iconSize}
        containerStyle={props?.containerStyle}
      />
    </ToolbarItem>
  );
};

import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import isMobileOrTablet from '../../../utils/isMobileOrTablet';
import LocalSwitchCamera from '../../../subComponents/LocalSwitchCamera';

export const SwitchCameraToolbarItem = props => {
  return (
    !$config.AUDIO_ROOM &&
    isMobileOrTablet() && (
      <ToolbarItem testID="switchCamera-btn" toolbarProps={props}>
        <LocalSwitchCamera />
      </ToolbarItem>
    )
  );
};

import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import LocalAudioMute from '../../../subComponents/LocalAudioMute';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export const LocalAudioToolbarItem = props => {
  const canAccessLocalAudio = useControlPermissionMatrix('localAudioControl');
  return (
    canAccessLocalAudio && (
      <ToolbarItem testID="localAudio-btn" toolbarProps={props}>
        <LocalAudioMute
          showToolTip={true}
          iconBGColor={props?.iconBGColor}
          iconSize={props?.iconSize}
          containerStyle={props?.containerStyle}
        />
      </ToolbarItem>
    )
  );
};

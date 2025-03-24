import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import LocalAudioMute from '../../../subComponents/LocalAudioMute';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

interface Props extends Partial<ToolbarItemProps> {
  showToolTip?: boolean;
}

export const LocalAudioToolbarItem = (props: Props) => {
  const {showToolTip = false, ...toolbarProps} = props;
  const canAccessLocalAudio = useControlPermissionMatrix('localAudioControl');
  return (
    canAccessLocalAudio && (
      <ToolbarItem testID="localAudio-btn" toolbarProps={toolbarProps}>
        <LocalAudioMute showToolTip={showToolTip} />
      </ToolbarItem>
    )
  );
};

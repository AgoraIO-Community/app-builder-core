import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import LocalVideoMute from '../../../subComponents/LocalVideoMute';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export const LocalVideoToolbarItem = props => {
  const canAccessLocalVideo = useControlPermissionMatrix('videoControl');
  return (
    canAccessLocalVideo && (
      <ToolbarItem testID="localVideo-btn" toolbarProps={props}>
        <LocalVideoMute showToolTip={true} />
      </ToolbarItem>
    )
  );
};

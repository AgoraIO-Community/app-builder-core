import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import ScreenshareButton from '../../../subComponents/screenshare/ScreenshareButton';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export const ScreenShareToolbarItem = props => {
  const canAccessScreenshare = useControlPermissionMatrix('screenshareControl');
  return (
    canAccessScreenshare && (
      <ToolbarItem testID="screenShare-btn" toolbarProps={props}>
        <ScreenshareButton />
      </ToolbarItem>
    )
  );
};

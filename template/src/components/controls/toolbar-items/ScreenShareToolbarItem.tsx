import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import ScreenshareButton from '../../../subComponents/screenshare/ScreenshareButton';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export interface Props extends ToolbarItemProps {}

export const ScreenShareToolbarItem = (props: Props) => {
  const canAccessScreenshare = useControlPermissionMatrix('screenshareControl');
  return (
    canAccessScreenshare && (
      <ToolbarItem testID="screenShare-btn" toolbarProps={props}>
        <ScreenshareButton />
      </ToolbarItem>
    )
  );
};

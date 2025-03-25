import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import LocalVideoMute from '../../../subComponents/LocalVideoMute';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export interface Props extends Partial<ToolbarItemProps> {
  showToolTip?: boolean;
}

export const LocalVideoToolbarItem = (props: Props) => {
  const {showToolTip = false, ...toolbarProps} = props;
  const canAccessLocalVideo = useControlPermissionMatrix('localVideoControl');
  return (
    canAccessLocalVideo && (
      <ToolbarItem testID="localVideo-btn" toolbarProps={toolbarProps}>
        <LocalVideoMute showToolTip={showToolTip} />
      </ToolbarItem>
    )
  );
};

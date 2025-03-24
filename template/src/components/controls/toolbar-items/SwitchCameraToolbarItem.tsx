import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import isMobileOrTablet from '../../../utils/isMobileOrTablet';
import LocalSwitchCamera from '../../../subComponents/LocalSwitchCamera';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export const SwitchCameraToolbarItem = props => {
  const canAccessLocalVideo = useControlPermissionMatrix('videoControl');
  return (
    canAccessLocalVideo &&
    isMobileOrTablet() && (
      <ToolbarItem testID="switchCamera-btn" toolbarProps={props}>
        <LocalSwitchCamera />
      </ToolbarItem>
    )
  );
};

import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import {SettingsIconButtonWithWrapper} from '../../Navbar';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export const SettingsToolbarItem = props => {
  const canAccessSettings = useControlPermissionMatrix('settingsControl');
  return (
    canAccessSettings && (
      <>
        <ToolbarItem testID="videocall-settingsicon" toolbarProps={props}>
          <SettingsIconButtonWithWrapper />
        </ToolbarItem>
      </>
    )
  );
};

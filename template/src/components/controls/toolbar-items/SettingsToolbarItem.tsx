import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import {SettingsIconButtonWithWrapper} from '../../Navbar';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';
import Settings from '../../Settings';
interface Props extends Omit<Partial<ToolbarItemProps>, 'children'> {
  withWrapper?: boolean;
}

export const SettingsToolbarItem = (props: Props) => {
  const {withWrapper = false, ...toolbarProps} = props;
  const canAccessSettings = useControlPermissionMatrix('settingsControl');
  return (
    canAccessSettings && (
      <>
        <ToolbarItem
          testID="videocall-settingsicon"
          toolbarProps={toolbarProps}>
          {withWrapper ? <SettingsIconButtonWithWrapper /> : <Settings />}
        </ToolbarItem>
      </>
    )
  );
};

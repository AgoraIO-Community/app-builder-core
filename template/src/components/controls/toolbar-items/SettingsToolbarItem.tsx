import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import {SettingsIconButtonWithWrapper} from '../../Navbar';
import Settings from '../../Settings';
export interface Props extends Omit<Partial<ToolbarItemProps>, 'children'> {
  withWrapper?: boolean;
}

export const SettingsToolbarItem = (props: Props) => {
  const {withWrapper = false, ...toolbarProps} = props;
  return (
    <ToolbarItem testID="videocall-settingsicon" toolbarProps={toolbarProps}>
      {withWrapper ? <SettingsIconButtonWithWrapper /> : <Settings />}
    </ToolbarItem>
  );
};

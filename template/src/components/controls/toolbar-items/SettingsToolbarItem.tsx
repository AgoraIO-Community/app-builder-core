import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import Settings from '../../Settings';

export interface Props extends Omit<Partial<ToolbarItemProps>, 'children'> {}

export const SettingsToolbarItem = (props: Props) => {
  return (
    <ToolbarItem testID="videocall-settingsicon" toolbarProps={props}>
      <Settings />
    </ToolbarItem>
  );
};

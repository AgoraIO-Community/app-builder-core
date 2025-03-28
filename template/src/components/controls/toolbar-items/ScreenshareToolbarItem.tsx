import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import ScreenshareButton from '../../../subComponents/screenshare/ScreenshareButton';

export interface Props extends ToolbarItemProps {}

export const ScreenshareToolbarItem = (props: Props) => {
  return (
    <ToolbarItem testID="screenShare-btn" toolbarProps={props}>
      <ScreenshareButton />
    </ToolbarItem>
  );
};

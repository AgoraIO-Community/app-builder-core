import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import ExitBreakoutRoomIconButton from '../../breakout-room/ui/ExitBreakoutRoomIconButton';

export interface Props extends ToolbarItemProps {}

export const ExitBreakoutRoomToolbarItem = (props: Props) => {
  return (
    <ToolbarItem testID="exit-breakout-room-btn" toolbarProps={props}>
      <ExitBreakoutRoomIconButton />
    </ToolbarItem>
  );
};

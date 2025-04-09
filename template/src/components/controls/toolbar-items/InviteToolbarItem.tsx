import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import CopyJoinInfo from '../../../subComponents/CopyJoinInfo';

export interface Props extends Omit<Partial<ToolbarItemProps>, 'children'> {}

export const InviteToolbarItem = (props: Props) => {
  return (
    <ToolbarItem testID="invite-btn" toolbarProps={props}>
      <CopyJoinInfo />
    </ToolbarItem>
  );
};

import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import CopyJoinInfo from '../../../subComponents/CopyJoinInfo';

export const InviteToolbarItem = props => {
  return (
    <ToolbarItem testID="invite-btn" toolbarProps={props}>
      <CopyJoinInfo />
    </ToolbarItem>
  );
};

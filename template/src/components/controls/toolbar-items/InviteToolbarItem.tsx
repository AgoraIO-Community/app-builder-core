import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import CopyJoinInfo from '../../../subComponents/CopyJoinInfo';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export const InviteToolbarItem = props => {
  const canAccessInvite = useControlPermissionMatrix('inviteControl');
  return (
    canAccessInvite && (
      <ToolbarItem testID="invite-btn" toolbarProps={props}>
        <CopyJoinInfo />
      </ToolbarItem>
    )
  );
};

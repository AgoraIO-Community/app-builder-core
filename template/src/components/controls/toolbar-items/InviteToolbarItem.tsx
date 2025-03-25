import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import CopyJoinInfo from '../../../subComponents/CopyJoinInfo';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export interface Props extends Omit<Partial<ToolbarItemProps>, 'children'> {}

export const InviteToolbarItem = (props: Props) => {
  const canAccessInvite = useControlPermissionMatrix('inviteControl');
  return (
    canAccessInvite && (
      <ToolbarItem testID="invite-btn" toolbarProps={props}>
        <CopyJoinInfo />
      </ToolbarItem>
    )
  );
};

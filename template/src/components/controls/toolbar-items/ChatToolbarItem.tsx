import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import {ChatIconButton} from '../../Navbar';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export interface Props extends Omit<Partial<ToolbarItemProps>, 'children'> {}

export const ChatToolbarItem = (props: Props) => {
  const canAccessChat = useControlPermissionMatrix('chatControl');

  return canAccessChat ? (
    <ToolbarItem testID="videocall-chaticon" toolbarProps={props}>
      <ChatIconButton />
    </ToolbarItem>
  ) : null;
};

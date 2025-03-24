import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import {ChatIconButton} from '../../Navbar';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export const ChatToolbarItem = props => {
  const canAccessChat = useControlPermissionMatrix('chatControl');

  return (
    canAccessChat && (
      <ToolbarItem testID="videocall-chaticon" toolbarProps={props}>
        <ChatIconButton />
      </ToolbarItem>
    )
  );
};

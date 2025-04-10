import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import {ChatIconButton} from '../../Navbar';

export interface Props extends Omit<Partial<ToolbarItemProps>, 'children'> {}

export const ChatToolbarItem = (props: Props) => {
  return (
    <ToolbarItem testID="videocall-chaticon" toolbarProps={props}>
      <ChatIconButton />
    </ToolbarItem>
  );
};

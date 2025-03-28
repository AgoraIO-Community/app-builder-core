import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import {ParticipantsIconButton} from '../../Navbar';

export interface Props extends ToolbarItemProps {}

export const ParticipantToolbarItem = (props: Props) => {
  return (
    <ToolbarItem testID="videocall-participantsicon" toolbarProps={props}>
      <ParticipantsIconButton />
    </ToolbarItem>
  );
};

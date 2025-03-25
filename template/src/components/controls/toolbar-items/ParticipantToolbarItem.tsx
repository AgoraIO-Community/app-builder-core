import React from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import {ParticipantsIconButton} from '../../Navbar';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export interface Props extends ToolbarItemProps {}

export const ParticipantToolbarItem = (props: Props) => {
  const canAccessParticipants =
    useControlPermissionMatrix('participantControl');

  return (
    canAccessParticipants && (
      <ToolbarItem testID="videocall-participantsicon" toolbarProps={props}>
        <ParticipantsIconButton />
      </ToolbarItem>
    )
  );
};

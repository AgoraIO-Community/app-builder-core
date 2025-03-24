import React from 'react';
import ToolbarItem from '../../../atoms/ToolbarItem';
import {ParticipantsIconButton} from '../../Navbar';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export const ParticipantToolbarItem = props => {
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

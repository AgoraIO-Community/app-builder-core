import React from 'react';
import {View} from 'react-native';
import ToolbarItem from '../../../atoms/ToolbarItem';
import ParticipantsCount from '../../../atoms/ParticipantsCount';
import {isWebInternal} from '../../../utils/common';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export const ParticipantCountToolbarItem = () => {
  const canViewParticipantsCounts =
    useControlPermissionMatrix('participantControl');

  return (
    canViewParticipantsCounts && (
      <ToolbarItem>
        <View>
          <View
            style={{
              width: 45,
              height: 35,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              zIndex: isWebInternal() ? 3 : 0,
            }}>
            <ParticipantsCount />
          </View>
        </View>
      </ToolbarItem>
    )
  );
};

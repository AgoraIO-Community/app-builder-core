import React, {useContext} from 'react';
import {PropsContext} from '../../../../agora-rn-uikit';
import {useRoomInfo} from './../../room-info/useRoomInfo';
import LiveStreamControls from './../../livestream/views/LiveStreamControls';
import {ClientRoleType} from '../../../../agora-rn-uikit';

export const RaiseHandToolbarItem = props => {
  const {rtcProps} = useContext(PropsContext);
  // attendee can view option if any host has started STT
  const {
    data: {isHost},
  } = useRoomInfo();
  return $config.EVENT_MODE ? (
    rtcProps?.role == ClientRoleType.ClientRoleAudience ? (
      <LiveStreamControls showControls={true} customProps={props} />
    ) : rtcProps?.role == ClientRoleType.ClientRoleBroadcaster ? (
      /**
       * In event mode when raise hand feature is active
       * and audience is promoted to host, the audience can also
       * demote himself
       */
      <LiveStreamControls showControls={!isHost} customProps={props} />
    ) : (
      <></>
    )
  ) : (
    <></>
  );
};

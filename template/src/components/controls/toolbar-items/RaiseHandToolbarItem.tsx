import React, {useContext} from 'react';
import ToolbarItem, {ToolbarItemProps} from '../../../atoms/ToolbarItem';
import {PropsContext} from '../../../../agora-rn-uikit';
import {useRoomInfo} from './../../room-info/useRoomInfo';
import {ClientRoleType} from '../../../../agora-rn-uikit';
import {LocalRaiseHand} from '../../../subComponents/livestream';
import {useControlPermissionMatrix} from '../useControlPermissionMatrix';

export interface Props extends ToolbarItemProps {}

export const RaiseHandToolbarItem = (props: Props) => {
  const {rtcProps} = useContext(PropsContext);
  const canAccessRaiseHand = useControlPermissionMatrix('raiseHandControl');
  const {
    data: {isHost},
  } = useRoomInfo();
  return canAccessRaiseHand ? (
    rtcProps?.role == ClientRoleType.ClientRoleAudience ? (
      <ToolbarItem toolbarProps={props}>
        <LocalRaiseHand />
      </ToolbarItem>
    ) : rtcProps?.role == ClientRoleType.ClientRoleBroadcaster && !isHost ? (
      /**
       * In event mode when raise hand feature is active
       * and audience is promoted to host, the audience can also
       * demote himself
       */
      <ToolbarItem toolbarProps={props}>
        <LocalRaiseHand />
      </ToolbarItem>
    ) : (
      <></>
    )
  ) : (
    <></>
  );
};

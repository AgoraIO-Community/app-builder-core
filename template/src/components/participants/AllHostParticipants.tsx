import React, {useContext} from 'react';
import {MinUidConsumer, MaxUidConsumer} from '../../../agora-rn-uikit';
import chatContext from '../ChatContext';

import MeParticipant from './MeParticipant';
import ScreenshareParticipants from './ScreenshareParticipants';
import RemoteParticipants from './RemoteParticipants';
import {UserType} from './../RTMConfigure';
import {useString} from '../../utils/useString';

export default function AllHostParticipants(props: any) {
  const {p_style, isHost} = props;
  const {userList, localUid} = useContext(chatContext);
  const screenshareName = useString<boolean>('screenshareUserName');
  const localUserDefaultLabel = useString('localUserDefaultLabel')();
  const localScreenshareDefaultLabel = useString(
    'localScreenshareDefaultLabel',
  )();
  const pstnUserLabel = useString('pstnUserLabel')();
  const remoteUserDefaultLabel = useString('remoteUserDefaultLabel')();
  const getParticipantName = (userUID: number | string) => {
    if (userUID === 'local')
      return userList[localUid]
        ? userList[localUid].name + ' '
        : localUserDefaultLabel + ' ';
    else if (userUID === 1)
      return userList[localUid]
        ? screenshareName(userList[localUid].name) + ' '
        : localScreenshareDefaultLabel + ' ';
    else
      return userList[userUID]
        ? userList[userUID].name + ' '
        : String(userUID)[0] === '1'
        ? pstnUserLabel + ' '
        : remoteUserDefaultLabel + ' ';
  };

  return (
    <MinUidConsumer>
      {(minUsers) => (
        <MaxUidConsumer>
          {(maxUser) =>
            [...minUsers, ...maxUser].map((user) =>
              user.uid === 'local' ? (
                <MeParticipant
                  name={getParticipantName(user.uid)}
                  p_style={p_style}
                  key={user.uid}
                />
              ) : user.uid === 1 ? (
                <ScreenshareParticipants
                  name={getParticipantName(user.uid)}
                  p_styles={p_style}
                  key={user.uid}
                />
              ) : (
                <RemoteParticipants
                  name={getParticipantName(user.uid)}
                  p_styles={p_style}
                  user={user}
                  showControls={
                    userList[user.uid]?.type !== UserType.ScreenShare
                  }
                  isHost={isHost}
                  key={user.uid}
                />
              ),
            )
          }
        </MaxUidConsumer>
      )}
    </MinUidConsumer>
  );
}

import React, {useContext} from 'react';
import {MinUidConsumer, MaxUidConsumer} from '../../../agora-rn-uikit';
import chatContext from '../ChatContext';

import MeParticipant from './MeParticipant';
import ScreenshareParticipants from './ScreenshareParticipants';
import RemoteParticipants from './RemoteParticipants';
import {UserType} from './../RTMConfigure';

export default function AllHostParticipants(props: any) {
  const {p_style, isHost} = props;
  const {userList, localUid} = useContext(chatContext);

  const getParticipantName = (userUID: number | string) => {
    if (userUID === 'local')
      return userList[localUid] ? userList[localUid].name + ' ' : 'You ';
    else if (userUID === 1)
      return userList[localUid]
        ? userList[localUid].name + "'s screenshare "
        : 'Your screenshare ';
    else
      return userList[userUID]
        ? userList[userUID].name + ' '
        : String(userUID)[0] === '1'
        ? 'PSTN User '
        : 'User ';
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

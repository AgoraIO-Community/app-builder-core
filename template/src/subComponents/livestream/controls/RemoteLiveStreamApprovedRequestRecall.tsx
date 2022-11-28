import React from 'react';
import IconButton from '../../../atoms/IconButton';
import {UidType} from '../../../../agora-rn-uikit';
import {LiveStreamControlMessageEnum} from '../../../components/livestream';
import events, {EventPersistLevel} from '../../../rtm-events-api';

export interface RemoteLiveStreamApprovedRequestRecallProps {
  uid: UidType;
}
const RemoteLiveStreamApprovedRequestRecall = (
  props: RemoteLiveStreamApprovedRequestRecallProps,
) => {
  return (
    <IconButton
      onPress={() => {
        events.send(
          LiveStreamControlMessageEnum.raiseHandRequestRejected,
          '',
          EventPersistLevel.LEVEL1,
          props.uid,
        );
      }}
      // color="#FD0845"
      //todo hari
      //icon={Icons['demoteIcon']}
    />
  );
};

export default RemoteLiveStreamApprovedRequestRecall;

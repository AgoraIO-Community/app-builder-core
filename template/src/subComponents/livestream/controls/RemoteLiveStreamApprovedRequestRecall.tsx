import React from 'react';
import {BtnTemplate, UidType} from '../../../../agora-rn-uikit';
import {LiveStreamControlMessageEnum} from '../../../components/livestream';
import events, {EventPersistLevel} from '../../../rtm-events-api';

export interface RemoteLiveStreamApprovedRequestRecallProps {
  uid: UidType;
}
const RemoteLiveStreamApprovedRequestRecall = (
  props: RemoteLiveStreamApprovedRequestRecallProps,
) => {
  return (
    <BtnTemplate
      style={{width: 24, height: 22}}
      onPress={() => {
        events.send(
          LiveStreamControlMessageEnum.raiseHandRequestRejected,
          '',
          EventPersistLevel.LEVEL1,
          props.uid,
        );
      }}
      color="#FD0845"
      //todo hari
      //icon={Icons['demoteIcon']}
    />
  );
};

export default RemoteLiveStreamApprovedRequestRecall;

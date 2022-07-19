import React from 'react';
import {BtnTemplate, UidType} from '../../../../agora-rn-uikit';
import {LiveStreamControlMessageEnum} from '../../../components/livestream';
import icons from '../../../assets/icons';
import useSendControlMessage, {
  CONTROL_MESSAGE_TYPE,
} from '../../../utils/useSendControlMessage';

export interface RemoteLiveStreamApprovedRequestRecallProps {
  uid: UidType;
}
const RemoteLiveStreamApprovedRequestRecall = (
  props: RemoteLiveStreamApprovedRequestRecallProps,
) => {
  const sendCtrlMsgToUid = useSendControlMessage();
  return (
    <BtnTemplate
      style={{width: 24, height: 22}}
      onPress={() => {
        sendCtrlMsgToUid(
          CONTROL_MESSAGE_TYPE.controlMessageToUid,
          LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall,
          props.uid,
        );
      }}
      color="#FD0845"
      icon={icons['demoteIcon']}
    />
  );
};

export default RemoteLiveStreamApprovedRequestRecall;

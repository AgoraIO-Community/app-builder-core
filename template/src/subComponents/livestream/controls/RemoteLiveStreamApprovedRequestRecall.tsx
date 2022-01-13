import React, {useContext} from 'react';
import ChatContext from '../../../components/ChatContext';
import {BtnTemplate} from '../../../../agora-rn-uikit';
import {LiveStreamControlMessageEnum} from '../../../components/livestream';

const RemoteLiveStreamApprovedRequestRecall = (props: {uid: number}) => {
  const {sendControlMessageToUid} = useContext(ChatContext);
  return (
    <BtnTemplate
      style={{width: 24, height: 22}}
      onPress={() => {
        sendControlMessageToUid(
          LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall,
          props.uid,
        );
      }}
      color="#FD0845"
      name="demoteIcon"
    />
  );
};

export default RemoteLiveStreamApprovedRequestRecall;

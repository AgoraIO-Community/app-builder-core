import React, {useContext} from 'react';
import ChatContext from '../../../components/ChatContext';
import {BtnTemplate} from '../../../../agora-rn-uikit';
import {LiveStreamControlMessageEnum} from '../../../components/livestream';
import icons from '../../../assets/icons';

export interface RemoteLiveStreamApprovedRequestRecallProps {
  uid: number;
}
const RemoteLiveStreamApprovedRequestRecall = (
  props: RemoteLiveStreamApprovedRequestRecallProps,
) => {
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
      icon={icons['demoteIcon']}
    />
  );
};

export default RemoteLiveStreamApprovedRequestRecall;

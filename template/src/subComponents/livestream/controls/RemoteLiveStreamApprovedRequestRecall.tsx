import React from 'react';
import {BtnTemplate, UidType} from '../../../../agora-rn-uikit';
import {LiveStreamControlMessageEnum} from '../../../components/livestream';
import icons from '../../../assets/icons';
import CustomEvents from '../../../custom-events';

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
        CustomEvents.send(
          LiveStreamControlMessageEnum.raiseHandRequestRejected,
          {},
          props.uid,
        );
      }}
      color="#FD0845"
      icon={icons['demoteIcon']}
    />
  );
};

export default RemoteLiveStreamApprovedRequestRecall;

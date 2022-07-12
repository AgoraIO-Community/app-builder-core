import React from 'react';
import {BtnTemplate} from '../../../../agora-rn-uikit';
import {LiveStreamControlMessageEnum} from '../../../components/livestream';
import icons from '../../../assets/icons';
import CustomEvents from '../../../custom-events/CustomEvents';

export interface RemoteLiveStreamApprovedRequestRecallProps {
  uid: number;
}
const RemoteLiveStreamApprovedRequestRecall = (
  props: RemoteLiveStreamApprovedRequestRecallProps,
) => {
  return (
    <BtnTemplate
      style={{width: 24, height: 22}}
      onPress={() => {
        CustomEvents.send(
          LiveStreamControlMessageEnum.raiseHandApprovedRequestRecall,
          {},
          props.uid.toString(),
        );
      }}
      color="#FD0845"
      icon={icons['demoteIcon']}
    />
  );
};

export default RemoteLiveStreamApprovedRequestRecall;

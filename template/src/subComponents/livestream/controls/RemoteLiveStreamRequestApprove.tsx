import React, {useContext} from 'react';
import {View} from 'react-native';
import {BtnTemplate, PropsContext, UidType} from '../../../../agora-rn-uikit';
import LiveStreamContext from '../../../components/livestream';
import icons from '../../../assets/icons';

export interface RemoteLiveStreamControlInterface {
  uid: UidType;
}

const RemoteLiveStreamRequestApprove = (
  props: RemoteLiveStreamControlInterface,
) => {
  const {uid} = props;
  const {hostApprovesRequestOfUID} = useContext(LiveStreamContext);
  const {styleProps} = useContext(PropsContext);
  const {remoteBtnStyles} = styleProps || {};

  const {liveStreamHostControlBtns} = remoteBtnStyles || {};

  return (
    <View style={{...(liveStreamHostControlBtns as object), marginRight: 15}}>
      <BtnTemplate
        disabled={!uid}
        icon={icons['checkCircleIcon']}
        style={{...(liveStreamHostControlBtns as object)}}
        onPress={() => {
          hostApprovesRequestOfUID(uid);
        }}
      />
    </View>
  );
};

export default RemoteLiveStreamRequestApprove;

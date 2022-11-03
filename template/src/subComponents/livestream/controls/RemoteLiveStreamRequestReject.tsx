import React, {useContext} from 'react';
import {View} from 'react-native';
import {BtnTemplate, PropsContext, UidType} from '../../../../agora-rn-uikit';
import LiveStreamContext from '../../../components/livestream';
import icons from '../../../assets/icons';

interface RemoteLiveStreamControlProps {
  uid: UidType;
}

const RemoteLiveStreamRequestReject = (props: RemoteLiveStreamControlProps) => {
  const {uid} = props;
  const {hostRejectsRequestOfUID} = useContext(LiveStreamContext);
  const {styleProps} = useContext(PropsContext);
  const {remoteBtnStyles} = styleProps || {};
  const {liveStreamHostControlBtns} = remoteBtnStyles || {};

  return (
    <View style={{...(liveStreamHostControlBtns as object)}}>
      <BtnTemplate
        disabled={!uid}
        icon={icons['crossCircleIcon']}
        style={{...(liveStreamHostControlBtns as object)}}
        onPress={() => {
          hostRejectsRequestOfUID(uid);
        }}
      />
    </View>
  );
};

export default RemoteLiveStreamRequestReject;

import React, {useContext} from 'react';
import {View} from 'react-native';
import {BtnTemplate, PropsContext, UidInterface} from '../../agora-rn-uikit';
import liveStreamContext from '../components/LiveStreamRequestContext';

interface RemoteAudioMuteInterface {
  user: UidInterface;
}

const RemoteLiveStreamRequestApprove: React.FC<RemoteAudioMuteInterface> = (
  props,
) => {
  const {user} = props;
  const {approveRequestOfUID} = useContext(liveStreamContext);
  const {styleProps} = useContext(PropsContext);
  const {remoteBtnStyles} = styleProps || {};
  const {liveStreamHostControlBtns} = remoteBtnStyles || {};

  return (
    <View style={{...(liveStreamHostControlBtns as object), marginRight: 15}}>
      <BtnTemplate
        name={'checkCircleIcon'}
        style={{...(liveStreamHostControlBtns as object)}}
        onPress={() => {
          approveRequestOfUID(user.uid);
        }}
      />
    </View>
  );
};

export default RemoteLiveStreamRequestApprove;

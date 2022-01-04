import React, {useContext} from 'react';
import {View} from 'react-native';
import {BtnTemplate, PropsContext, UidInterface} from '../../agora-rn-uikit';
import liveStreamContext from '../components/LiveStreamRequestContext';

interface RemoteAudioMuteInterface {
  user: UidInterface;
}

const RemoteLiveStreamRequestReject: React.FC<RemoteAudioMuteInterface> = (
  props,
) => {
  const {user} = props;
  const {rejectRequestOfUID} = useContext(liveStreamContext);
  const {styleProps} = useContext(PropsContext);
  const {remoteBtnStyles} = styleProps || {};
  const {liveStreamHostControlBtns} = remoteBtnStyles || {};

  return (
    <View style={{...(liveStreamHostControlBtns as object)}}>
      <BtnTemplate
        name={'crossCircleIcon'}
        style={{...(liveStreamHostControlBtns as object)}}
        onPress={() => {
          rejectRequestOfUID(user.uid);
        }}
      />
    </View>
  );
};

export default RemoteLiveStreamRequestReject;

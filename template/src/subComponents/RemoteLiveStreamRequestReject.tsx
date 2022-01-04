import React, {useContext} from 'react';
import {View} from 'react-native';
import {BtnTemplate, PropsContext, UidInterface} from '../../agora-rn-uikit';

interface RemoteAudioMuteInterface {
  user: UidInterface;
}

const RemoteLiveStreamRequestReject: React.FC<RemoteAudioMuteInterface> = (
  props,
) => {
  const {styleProps} = useContext(PropsContext);
  const {remoteBtnStyles} = styleProps || {};
  const {liveStreamHostControlBtns} = remoteBtnStyles || {};

  return (
    <View style={{...(liveStreamHostControlBtns as object)}}>
      <BtnTemplate
        name={'crossCircleIcon'}
        style={{...(liveStreamHostControlBtns as object)}}
        onPress={() => {
          console.log('live stream reject');
        }}
      />
    </View>
  );
};

export default RemoteLiveStreamRequestReject;

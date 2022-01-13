import React, {useContext} from 'react';
import {View} from 'react-native';
import {
  BtnTemplate,
  PropsContext,
  UidInterface,
} from '../../../../agora-rn-uikit';
import LiveStreamContext from '../../../components/livestream';

interface RemoteLiveStreamControlInterface {
  user: UidInterface;
}

const RemoteLiveStreamRequestReject: React.FC<RemoteLiveStreamControlInterface> =
  (props) => {
    const {user} = props;
    const {rejectRequestOfUID} = useContext(LiveStreamContext);
    const {styleProps} = useContext(PropsContext);
    console.log('styleProps: ', styleProps);
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

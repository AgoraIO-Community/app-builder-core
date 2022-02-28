import React, {useContext} from 'react';
import {View} from 'react-native';
import {
  BtnTemplate,
  PropsContext,
  UidInterface,
} from '../../../../agora-rn-uikit';
import LiveStreamContext from '../../../components/livestream';
import icons from '../../../assets/icons';

interface RemoteLiveStreamControlInterface {
  user: UidInterface;
}

const RemoteLiveStreamRequestReject: React.FC<RemoteLiveStreamControlInterface> =
  (props) => {
    const {user} = props;
    const {hostRejectsRequestOfUID} = useContext(LiveStreamContext);
    const {styleProps} = useContext(PropsContext);
    const {remoteBtnStyles} = styleProps || {};
    const {liveStreamHostControlBtns} = remoteBtnStyles || {};

    return (
      <View style={{...(liveStreamHostControlBtns as object)}}>
        <BtnTemplate
          disabled={!user?.uid}
          icon={icons['crossCircleIcon']}
          style={{...(liveStreamHostControlBtns as object)}}
          onPress={() => {
            hostRejectsRequestOfUID(user.uid);
          }}
        />
      </View>
    );
  };

export default RemoteLiveStreamRequestReject;

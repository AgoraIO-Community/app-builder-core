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

const RemoteLiveStreamRequestApprove: React.FC<RemoteLiveStreamControlInterface> =
  (props) => {
    const {user} = props;
    const {hostApprovesRequestOfUID} = useContext(LiveStreamContext);
    const {styleProps} = useContext(PropsContext);
    const {remoteBtnStyles} = styleProps || {};

    const {liveStreamHostControlBtns} = remoteBtnStyles || {};

    return (
      <View style={{...(liveStreamHostControlBtns as object), marginRight: 15}}>
        <BtnTemplate
          disabled={!user?.uid}
          icon={icons['checkCircleIcon']}
          style={{...(liveStreamHostControlBtns as object)}}
          onPress={() => {
            hostApprovesRequestOfUID(user?.uid);
          }}
        />
      </View>
    );
  };

export default RemoteLiveStreamRequestApprove;

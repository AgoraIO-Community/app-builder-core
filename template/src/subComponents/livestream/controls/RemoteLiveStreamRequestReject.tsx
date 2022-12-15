import React, {useContext} from 'react';
import {View} from 'react-native';
import {PropsContext, UidType} from '../../../../agora-rn-uikit';
import LiveStreamContext from '../../../components/livestream';
import TertiaryButton from '../../../atoms/TertiaryButton';

interface RemoteLiveStreamControlProps {
  uid: UidType;
}

const RemoteLiveStreamRequestReject = (props: RemoteLiveStreamControlProps) => {
  const {uid} = props;
  const {hostRejectsRequestOfUID} = useContext(LiveStreamContext);

  return (
    <TertiaryButton
      containerStyle={{
        paddingHorizontal: 12,
      }}
      disabled={!uid}
      onPress={() => hostRejectsRequestOfUID(uid)}
      text={'Deny'}
    />
  );
};

export default RemoteLiveStreamRequestReject;

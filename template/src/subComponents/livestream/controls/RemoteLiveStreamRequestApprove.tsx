import React, {useContext} from 'react';
import {View} from 'react-native';
import {PropsContext, UidType} from '../../../../agora-rn-uikit';
import LiveStreamContext from '../../../components/livestream';
import PrimaryButton from '../../../atoms/PrimaryButton';

export interface RemoteLiveStreamControlProps {
  uid: UidType;
}

const RemoteLiveStreamRequestApprove = (
  props: RemoteLiveStreamControlProps,
) => {
  const {uid} = props;
  const {hostApprovesRequestOfUID} = useContext(LiveStreamContext);

  return (
    <PrimaryButton
      containerStyle={{
        minWidth: 59,
        maxWidth: 59,
        borderRadius: 4,
      }}
      textStyle={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontWeight: '600',
        fontSize: 12,
      }}
      disabled={!uid}
      text={'Accept'}
      onPress={() => {
        hostApprovesRequestOfUID(uid);
      }}
    />
  );
};

export default RemoteLiveStreamRequestApprove;

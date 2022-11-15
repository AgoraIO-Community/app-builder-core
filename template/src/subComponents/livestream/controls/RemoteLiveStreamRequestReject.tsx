import React, {useContext} from 'react';
import {View} from 'react-native';
import {BtnTemplate, PropsContext, UidType} from '../../../../agora-rn-uikit';
import LiveStreamContext from '../../../components/livestream';
import PrimaryButton from '../../../atoms/PrimaryButton';

interface RemoteLiveStreamControlProps {
  uid: UidType;
}

const RemoteLiveStreamRequestReject = (props: RemoteLiveStreamControlProps) => {
  const {uid} = props;
  const {hostRejectsRequestOfUID} = useContext(LiveStreamContext);

  return (
    <PrimaryButton
      containerStyle={{
        maxWidth: 59,
        minWidth: 59,
        height: 28,
        borderColor: '#000000',
        borderWidth: 1,
        backgroundColor: 'white',
      }}
      textStyle={{
        color: '#000000',
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontFamily: 'Source Sans Pro',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 12,
      }}
      onPress={() => hostRejectsRequestOfUID(uid)}
      text={'Deny'}
      disabled={!uid}
    />
  );
};

export default RemoteLiveStreamRequestReject;

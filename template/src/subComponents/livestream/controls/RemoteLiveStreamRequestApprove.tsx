import React, {useContext} from 'react';
import {View} from 'react-native';
import {BtnTemplate, PropsContext, UidType} from '../../../../agora-rn-uikit';
import LiveStreamContext from '../../../components/livestream';
import icons from '../../../assets/icons';
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
        height: 28,
      }}
      textStyle={{
        color: '#ffffff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontFamily: 'Source Sans Pro',
        fontStyle: 'normal',
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

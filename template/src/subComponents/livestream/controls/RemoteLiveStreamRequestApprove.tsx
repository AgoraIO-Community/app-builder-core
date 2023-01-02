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
    <View style={{flex: 1}}>
      <PrimaryButton
        containerStyle={{
          minWidth: 'auto',
          borderRadius: 4,
          height: 38,
          paddingHorizontal: 8,
          paddingVertical: 8,
        }}
        textStyle={{
          fontWeight: '600',
          fontSize: 12,
        }}
        disabled={!uid}
        text={'Accept'}
        onPress={() => {
          hostApprovesRequestOfUID(uid);
        }}
      />
    </View>
  );
};

export default RemoteLiveStreamRequestApprove;

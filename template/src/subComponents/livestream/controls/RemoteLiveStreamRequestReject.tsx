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
    <View style={{flex: 1}}>
      <TertiaryButton
        containerStyle={{
          paddingHorizontal: 8,
          paddingVertical: 8,
          height: 38,
        }}
        disabled={!uid}
        onPress={() => hostRejectsRequestOfUID(uid)}
        text={'Deny'}
      />
    </View>
  );
};

export default RemoteLiveStreamRequestReject;

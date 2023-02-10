import React, {useContext} from 'react';
import {View} from 'react-native';
import {PropsContext, UidType} from '../../../../agora-rn-uikit';
import LiveStreamContext from '../../../components/livestream';
import TertiaryButton from '../../../atoms/TertiaryButton';
import Toast from '../../../../react-native-toast-message';

interface RemoteLiveStreamControlProps {
  uid: UidType;
  toastId: number;
}

const RemoteLiveStreamRequestReject = (props: RemoteLiveStreamControlProps) => {
  const {uid, toastId} = props;
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
        onPress={() => {
          //Hiding the toast if its get rejected in the participant panel
          if (Toast.getToastId() === toastId) {
            Toast.hide();
          }
          hostRejectsRequestOfUID(uid);
        }}
        text={'DENY'}
      />
    </View>
  );
};

export default RemoteLiveStreamRequestReject;

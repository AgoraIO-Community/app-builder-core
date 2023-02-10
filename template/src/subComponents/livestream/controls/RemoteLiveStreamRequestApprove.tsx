import React, {useContext} from 'react';
import {View} from 'react-native';
import {PropsContext, UidType} from '../../../../agora-rn-uikit';
import LiveStreamContext from '../../../components/livestream';
import PrimaryButton from '../../../atoms/PrimaryButton';
import ThemeConfig from '../../../theme';
import Toast from '../../../../react-native-toast-message';

export interface RemoteLiveStreamControlProps {
  uid: UidType;
  toastId: number;
}

const RemoteLiveStreamRequestApprove = (
  props: RemoteLiveStreamControlProps,
) => {
  const {uid, toastId} = props;
  const {hostApprovesRequestOfUID} = useContext(LiveStreamContext);

  return (
    <View style={{flex: 1}}>
      <PrimaryButton
        containerStyle={{
          minWidth: 'auto',
          borderRadius: ThemeConfig.BorderRadius.small,
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
          //Hiding the toast if its get approved in the participant panel
          if (Toast.getToastId() === toastId) {
            Toast.hide();
          }
          hostApprovesRequestOfUID(uid);
        }}
      />
    </View>
  );
};

export default RemoteLiveStreamRequestApprove;

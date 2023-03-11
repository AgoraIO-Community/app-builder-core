import React from 'react';
import {View} from 'react-native';
import TertiaryButton from '../atoms/TertiaryButton';
import isSDK from '../utils/isSDK';
import {useAuth} from './AuthProvider';
import {useIDPAuth} from './useIDPAuth';

const IDPLogoutComponent = () => {
  const {idpLogout} = useIDPAuth();
  const {authenticated} = useAuth();
  return authenticated && $config.ENABLE_IDP_AUTH && !isSDK() ? (
    <View style={{position: 'absolute', top: 10, right: 10, zIndex: 10}}>
      <TertiaryButton
        text="Logout"
        onPress={() => {
          idpLogout();
        }}
      />
    </View>
  ) : (
    <></>
  );
};
export default IDPLogoutComponent;

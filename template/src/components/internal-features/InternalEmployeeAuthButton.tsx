/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.
 Use without a license or in violation of any license terms and conditions (including use for
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more
 information visit https://appbuilder.agora.io.
*********************************************
*/
import React, {useContext, useEffect, useState} from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Toast from '../../../react-native-toast-message';
import useInternalEmployeeAuth, {
  getDummyInternalFeature,
  isInternalEmployeeAuthEnabledForApp,
  isInternalEmployeeVerificationActive,
} from '../../auth/useInternalEmployeeAuth';
import ThemeConfig from '../../theme';
import StorageContext from '../StorageContext';
import {isWebInternal} from '../../utils/common';

interface InternalEmployeeAuthButtonProps {
  containerStyle?: StyleProp<ViewStyle>;
}

const InternalEmployeeAuthButton = (props: InternalEmployeeAuthButtonProps) => {
  const {store, setStore} = useContext(StorageContext);
  const [authRequired, setAuthRequired] = useState(false);
  const [statusChecking, setStatusChecking] = useState(false);
  const {authenticate, loading} = useInternalEmployeeAuth();

  const isInternalEmployeeAuthApp =
    isWebInternal() && isInternalEmployeeAuthEnabledForApp();
  const hasActiveInternalEmployeeToken =
    !!store?.internalEmployeeToken &&
    isInternalEmployeeVerificationActive(store?.internalEmployeeVerifiedUntil);

  useEffect(() => {
    let cancelled = false;

    const validateInternalEmployeeToken = async () => {
      if (!isInternalEmployeeAuthApp) {
        setAuthRequired(false);
        return;
      }

      if (!hasActiveInternalEmployeeToken) {
        setAuthRequired(true);
        return;
      }

      setStatusChecking(true);
      try {
        await getDummyInternalFeature(store.internalEmployeeToken);
        if (!cancelled) {
          setAuthRequired(false);
        }
      } catch (error) {
        if (!cancelled) {
          setStore?.(prevState => ({
            ...prevState,
            internalEmployeeToken: null,
            internalEmployeeVerifiedUntil: null,
          }));
          setAuthRequired(true);
        }
      } finally {
        if (!cancelled) {
          setStatusChecking(false);
        }
      }
    };

    validateInternalEmployeeToken();

    return () => {
      cancelled = true;
    };
  }, [
    hasActiveInternalEmployeeToken,
    isInternalEmployeeAuthApp,
    setStore,
    store?.internalEmployeeToken,
  ]);

  const handlePress = async () => {
    try {
      await authenticate();
      setAuthRequired(false);
      Toast.show({
        leadingIconName: 'tick-fill',
        type: 'success',
        text1: 'Agora employee login complete',
        visibilityTime: 3000,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
    } catch (error) {
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: 'Agora employee login failed',
        text2:
          error instanceof Error ? error.message : 'Please try again later.',
        visibilityTime: 1000 * 10,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
    }
  };

  if (!isInternalEmployeeAuthApp || !authRequired) {
    return <></>;
  }

  return (
    <View style={[style.container, props.containerStyle]}>
      <TouchableOpacity
        style={[style.button, loading || statusChecking ? style.disabled : {}]}
        disabled={loading || statusChecking}
        onPress={handlePress}>
        <Text
          style={[
            style.text,
            loading || statusChecking ? style.disabledText : {},
          ]}>
          {loading || statusChecking ? 'Opening...' : 'Employee login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderRadius: ThemeConfig.BorderRadius.medium,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '700',
  },
  disabledText: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
});

export default InternalEmployeeAuthButton;

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
import Toast from '../../../react-native-toast-message';
import SecondaryButton from '../../atoms/SecondaryButton';
import Spacer from '../../atoms/Spacer';
import useInternalEmployeeAuth, {
  getDummyInternalFeature,
  isInternalEmployeeAuthEnabledForApp,
  isInternalEmployeeVerificationActive,
} from '../../auth/useInternalEmployeeAuth';
import StorageContext from '../StorageContext';
import {isWebInternal} from '../../utils/common';

const InternalEmployeeAuthButton = () => {
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
    <>
      <Spacer size={24} />
      <SecondaryButton
        disabled={loading || statusChecking}
        text={
          loading || statusChecking
            ? 'Opening employee login...'
            : 'Agora employee login'
        }
        onPress={handlePress}
      />
    </>
  );
};

export default InternalEmployeeAuthButton;

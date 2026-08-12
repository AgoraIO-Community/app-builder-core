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
import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Toast from '../../../react-native-toast-message';
import SecondaryButton from '../../atoms/SecondaryButton';
import Spacer from '../../atoms/Spacer';
import useInternalEmployeeAuth, {
  isInternalEmployeeAuthEnabledForApp,
} from '../../auth/useInternalEmployeeAuth';
import ThemeConfig from '../../theme';
import {isWebInternal} from '../../utils/common';

const InternalFeatureTest = () => {
  const [loading, setLoading] = useState(false);
  const {checkDummyInternalFeature} = useInternalEmployeeAuth();

  if (!isWebInternal() || !isInternalEmployeeAuthEnabledForApp()) {
    return <></>;
  }

  const handlePress = async () => {
    setLoading(true);
    try {
      const response = await checkDummyInternalFeature();
      Toast.show({
        leadingIconName: 'tick-fill',
        type: 'success',
        text1: 'Internal API access granted',
        text2: response?.message || 'Employee verification is active.',
        visibilityTime: 3000,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
    } catch (error) {
      Toast.show({
        leadingIconName: 'alert',
        type: 'error',
        text1: 'Internal API access denied',
        text2:
          error instanceof Error
            ? error.message
            : 'Employee verification is required.',
        visibilityTime: 1000 * 10,
        primaryBtn: null,
        secondaryBtn: null,
        leadingIcon: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Spacer size={24} />
      <View style={style.container}>
        <Text style={style.title}>Internal access test</Text>
        <Spacer size={12} />
        <SecondaryButton
          disabled={loading}
          text={loading ? 'Checking...' : 'Test internal API'}
          onPress={handlePress}
        />
      </View>
    </>
  );
};

const style = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderRadius: 8,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    padding: 16,
  },
  title: {
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '600',
  },
});

export default InternalFeatureTest;

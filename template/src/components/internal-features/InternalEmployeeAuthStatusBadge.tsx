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
import React, {useContext} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  isInternalEmployeeAuthEnabledForApp,
  isInternalEmployeeVerificationActive,
} from '../../auth/useInternalEmployeeAuth';
import ThemeConfig from '../../theme';
import {isWebInternal} from '../../utils/common';
import StorageContext from '../StorageContext';

const InternalEmployeeAuthStatusBadge = () => {
  const {store} = useContext(StorageContext);
  const isAuthenticated =
    !!store?.internalEmployeeToken &&
    isInternalEmployeeVerificationActive(store?.internalEmployeeVerifiedUntil);

  if (
    !isWebInternal() ||
    !isInternalEmployeeAuthEnabledForApp() ||
    !isAuthenticated
  ) {
    return <></>;
  }

  return (
    <View style={style.container} testID="internal-employee-auth-status">
      <View style={style.indicator} />
      <Text style={style.text}>Agora employee authenticated</Text>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR + '20',
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  text: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.tiny,
    fontWeight: '600',
  },
});

export default InternalEmployeeAuthStatusBadge;

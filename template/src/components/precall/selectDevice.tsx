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

import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {isValidReactComponent, isWeb} from '../../utils/common';
import SelectDevice from '../../subComponents/SelectDevice';
import {useString} from '../../utils/useString';
import {useFpe} from 'fpe-api';

const selectDevice: React.FC = () => {
  const selectInputDeviceLabel = useString('selectInputDeviceLabel')();
  const {SelectDeviceAfterView, SelectDeviceBeforeView} = useFpe((data) => {
    let components: {
      SelectDeviceAfterView: React.ComponentType;
      SelectDeviceBeforeView: React.ComponentType;
    } = {
      SelectDeviceAfterView: React.Fragment,
      SelectDeviceBeforeView: React.Fragment,
    };
    if (
      data?.components?.precall &&
      typeof data?.components?.precall === 'object'
    ) {
      if (
        data?.components?.precall?.deviceSelect &&
        typeof data?.components?.precall?.deviceSelect === 'object'
      ) {
        if (
          data?.components?.precall?.deviceSelect?.before &&
          isValidReactComponent(data?.components?.precall?.deviceSelect?.before)
        ) {
          components.SelectDeviceBeforeView =
            data?.components?.precall?.deviceSelect?.before;
        }

        if (
          data?.components?.precall?.deviceSelect?.after &&
          isValidReactComponent(data?.components?.precall?.deviceSelect?.after)
        ) {
          components.SelectDeviceAfterView =
            data?.components?.precall?.deviceSelect?.after;
        }
      }
    }
    return components;
  });
  return (
    <>
      <SelectDeviceBeforeView />
      <Text style={style.subHeading}>{selectInputDeviceLabel}</Text>
      <View
        style={{
          flex: 1,
          maxWidth: isWeb ? '25vw' : 'auto',
          marginVertical: 30,
        }}>
        <SelectDevice />
      </View>
      <SelectDeviceAfterView />
    </>
  );
};

export default selectDevice;

const style = StyleSheet.create({
  subHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: $config.PRIMARY_FONT_COLOR,
  },
});

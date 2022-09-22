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
import {View, StyleSheet} from 'react-native';
import Logo from '../../subComponents/Logo';
import {useHasBrandLogo} from '../../utils/common';

const CommonLogo: React.FC = () => {
  const hasBrandLogo = useHasBrandLogo();
  return (
    <View style={style.nav}>
      {hasBrandLogo() && <Logo />}
      {/* <OpenInNativeButton /> */}
    </View>
  );
};
export default CommonLogo;
const style = StyleSheet.create({
  nav: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

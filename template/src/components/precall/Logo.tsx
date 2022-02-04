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

import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native'
import Logo from '../../subComponents/Logo';
import hasBrandLogo from '../../utils/hasBrandLogo';
import Error from '../../subComponents/Error';
import PreCallContext from './PreCallContext';

const PreCallLogo: React.FC = () => {
  const {error} = useContext(PreCallContext)
  return (
    <View style={style.nav}>
      {hasBrandLogo && <Logo />}{/**TODO:hari update logo cmp works for localimage and url */}
      {error ? <Error error={error} showBack={true} /> : <></>}
      {/* <OpenInNativeButton /> */}
    </View>
  )
}
export default PreCallLogo;
const style = StyleSheet.create({
  nav: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
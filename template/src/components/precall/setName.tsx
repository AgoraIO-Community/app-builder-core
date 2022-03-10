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

import { useFpe } from 'fpe-api';
import React from 'react';
import { View, StyleSheet } from 'react-native'
import { cmpTypeGuard } from '../../utils/common';
import { PreCallJoinBtn, PreCallTextInput } from './index';

const setName: React.FC = () => {
  const {joinButton, textBox} = useFpe(data => typeof data.components?.precall === 'object' ? data.components?.precall : {});
  return (
    <View style={[style.margin5Btm, { alignItems: 'center' }]}>
      {cmpTypeGuard(textBox, PreCallTextInput)}
      <View style={style.margin5Btm} />
      {cmpTypeGuard(joinButton, PreCallJoinBtn) }
    </View>
  )
}

export default setName;

const style = StyleSheet.create({
  margin5Btm: { marginBottom: '5%' }
})

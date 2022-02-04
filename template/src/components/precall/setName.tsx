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
import TextInput from '../../atoms/TextInput';
import PrimaryButton from '../../atoms/PrimaryButton';
import PreCallContext from './PreCallContext';

const setName: React.FC = () => {
  const { username, setUsername, queryComplete, setCallActive } = useContext(PreCallContext)
  return (
    <View style={[style.margin5Btm, { alignItems: 'center' }]}>
      <TextInput
        value={username}
        onChangeText={(text) => {
          setUsername(text);
        }}
        onSubmitEditing={() => { }}
        placeholder={
          queryComplete ? 'Display name*' : 'Getting name...'
        }
        editable={queryComplete}
      />
      <View style={style.margin5Btm} />
      <PrimaryButton
        onPress={() => setCallActive(true)}
        disabled={!queryComplete || username.trim() === ''}
        text={queryComplete ? 'Join Room' : 'Loading...'}
      />
    </View>
  )
}

export default setName;

const style = StyleSheet.create({
  margin5Btm: { marginBottom: '5%' }
})

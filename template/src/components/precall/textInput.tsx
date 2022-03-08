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
import { Platform } from 'react-native';
import { usePreCall } from 'fpe-api';
import TextInput from '../../atoms/TextInput';

const PreCallTextInput: React.FC = () => {
  const { username, setUsername, queryComplete } = usePreCall(data => data)
  return (
    <TextInput
      value={username}
      onChangeText={(text) => setUsername(text ? text.trim() : text)}
      onSubmitEditing={() => { }}
      placeholder={
        queryComplete ? 'Display name*' : 'Getting name...'
      }
      editable={Platform.OS === 'ios' ? queryComplete : true}
    />
  )
}

export default PreCallTextInput;
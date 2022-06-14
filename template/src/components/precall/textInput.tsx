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
import TextInput from '../../atoms/TextInput';
import {useString} from '../../utils/useString';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';
import useSetName from '../../utils/useSetName';
import useGetName from '../../utils/useGetName';
import {useFpe} from 'fpe-api';
import {isValidReactComponent} from '../../utils/common';

const PreCallTextInput: React.FC = () => {
  const userNamePlaceholder = useString('userNamePlaceholder')();
  const fetchingNamePlaceholder = useString('fetchingNamePlaceholder')();
  const username = useGetName();
  const setUsername = useSetName();
  const {isJoinDataFetched} = useMeetingInfo();

  const {TextInputAfterView, TextInputBeforeView} = useFpe((data) => {
    let components: {
      TextInputAfterView: React.ComponentType;
      TextInputBeforeView: React.ComponentType;
    } = {
      TextInputAfterView: React.Fragment,
      TextInputBeforeView: React.Fragment,
    };
    if (
      data?.components?.precall &&
      typeof data?.components?.precall === 'object'
    ) {
      if (
        data?.components?.precall?.textBox &&
        typeof data?.components?.precall?.textBox === 'object'
      ) {
        if (
          data?.components?.precall?.textBox?.before &&
          isValidReactComponent(data?.components?.precall?.textBox?.before)
        ) {
          components.TextInputBeforeView =
            data?.components?.precall?.textBox?.before;
        }
        if (
          data?.components?.precall?.textBox?.after &&
          isValidReactComponent(data?.components?.precall?.textBox?.after)
        ) {
          components.TextInputAfterView =
            data?.components?.precall?.textBox?.after;
        }
      }
    }
    return components;
  });

  return (
    <>
      <TextInputBeforeView />
      <TextInput
        value={username}
        onChangeText={(text) => setUsername(text ? text.trim() : text)}
        onSubmitEditing={() => {}}
        placeholder={
          isJoinDataFetched ? userNamePlaceholder : fetchingNamePlaceholder
        }
        editable={isJoinDataFetched}
      />
      <TextInputAfterView />
    </>
  );
};

export default PreCallTextInput;

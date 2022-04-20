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
/**
 * @format
 */
import React, {useEffect, useState} from 'react';
import {fpeConfig} from 'fpe-api';
import {installFPE as createFPE} from 'fpe-api/install';
import App from './src/App';
import {SDKEvents} from './src/utils/SdkEvents'

const AppBuilderView = () => {
  const [fpe, setFpe] = useState(fpeConfig);
  useEffect(() => {
    SDKEvents.on('addFpe', (sdkFpeConfig) => {
      console.log('DEBUG(aditya)-SDKEvents: event callback:','addFpe');
      setFpe(sdkFpeConfig);
    });
  }, []);
  return (
    <>
      <App fpeConfig={fpe} />
    </>
  );
};

const AppBuilderMethods = {
  View: AppBuilderView,
  addFPE: (fpeConfig) => {
    SDKEvents.emit('addFpe', fpeConfig);
  },
  createFPE,
};

export default AppBuilderMethods;

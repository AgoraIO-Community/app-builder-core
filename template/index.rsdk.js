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
import {installFPE as createFPE} from 'fpe-api/install';
import App from './src/App';
import {SDKEvents} from './src/utils/eventEmitter';

function addFPE(fpeConfig) {
  console.log('addFpe', fpeConfig);
  SDKEvents.emit('addFpe', fpeConfig);
}

const AppBuilderView = () => {
  const [fpeConfig, setFpeConfig] = useState({});
  useEffect(() => {
    SDKEvents.on('addFpe', (sdkFpeConfig) => {
      console.log({addFpe: sdkFpeConfig});
      setFpeConfig(sdkFpeConfig);
    });
  }, []);

  const View = () => <App fpeConfig={fpeConfig} />;
  return View();
};
export default {
  View: AppBuilderView,
  addFPE,
  createFPE,
};
export {App};

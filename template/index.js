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

import {AppRegistry} from 'react-native';
import 'react-native-url-polyfill/auto';
import App from './src/App';
import {name as appName} from './app.json';
import React from 'react';
import {
  DatadogProvider,
  getConfig,
} from './src/logger/transports/agora-transport';
import {ENABLE_AGORA_LOGGER_TRANSPORT} from './src/logger/constants';

if (ENABLE_AGORA_LOGGER_TRANSPORT) {
  const config = getConfig();
  const AppWithLogs = () => (
    <DatadogProvider configuration={config}>
      <App />
    </DatadogProvider>
  );
  AppRegistry.registerComponent(appName, () => AppWithLogs);
} else {
  AppRegistry.registerComponent(appName, () => App);
}

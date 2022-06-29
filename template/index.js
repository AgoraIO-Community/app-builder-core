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

import {AppRegistry, Platform} from 'react-native';
import * as Sentry from '@sentry/react-native';
import App from './src/App';
import {name as appName} from './app.json';
import logger, {commonMetadata, transportsEnum} from './src/utils/logger';
import pkg from './package.json';
import config from './config.json';

Sentry.init({
  dsn: 'https://b5df0450fe284baa8376e62ace331580@o615358.ingest.sentry.io/5749898',
});

logger.log('SESSION_STARTED', {
  app_id: $config.APP_ID,
  core_version: pkg.version,
  config: {...config, LOGO: null, ICON: null, BG: null},
  sdk_version: {
    rtm: pkg.dependencies['agora-react-native-rtm'],
    rtc: pkg.dependencies['react-native-agora'],
  },
  OS: `${Platform.OS}-${Platform.Version}`,
});

AppRegistry.registerComponent(appName, () => App);

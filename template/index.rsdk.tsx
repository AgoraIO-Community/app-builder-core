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
import {FpeApiInterface} from 'fpe-api';
import {installFPE as createFPE} from 'fpe-api/install';
import {SDKEvents} from './src/utils/SdkEvents';
import SDKAppWrapper from './src/SDKAppWrapper';
import React from 'react';
export * from 'fpe-api';

interface AppBuilderMethodsInterface {
  View: React.FC;
  addFPE: (fpe: FpeApiInterface) => void;
  createFPE: (fpe: FpeApiInterface) => FpeApiInterface;
}

const AppBuilderMethods: AppBuilderMethodsInterface = {
  View: SDKAppWrapper,
  addFPE: (fpeConfig: FpeApiInterface) => {
    SDKEvents.emit('addFpe', fpeConfig);
  },
  createFPE,
};

export default AppBuilderMethods;

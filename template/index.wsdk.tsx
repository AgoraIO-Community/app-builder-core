import {AppRegistry} from 'react-native';
import React, {useEffect, useState} from 'react';
import App from './src/App';

import {fpeConfig, FpeApiInterface} from 'fpe-api';
import {SDKEvents} from './src/utils/SdkEvents'
import {installFPE as createFPE} from 'fpe-api/install';

const AppBuilderView = () => {
  const [fpe, setFpe] = useState(fpeConfig);
  useEffect(() => {
    SDKEvents.on('addFpe', (sdkFpeConfig) => {
      console.log('DEBUG(aditya)-SDKEvents: event called');
      setFpe(sdkFpeConfig);
    });
  }, []);
  return (
    <>
      <App fpeConfig={fpe} />
    </>
  );
};

interface AppBuilderMethodsInterface{
  addFPE: (fpe:FpeApiInterface) => void;
  createFPE: (fpe:FpeApiInterface) => FpeApiInterface;
}

const AppBuilderMethods:AppBuilderMethodsInterface = {
  addFPE: (fpeConfig: FpeApiInterface) => {
    SDKEvents.emit('addFpe', fpeConfig);
  },
  createFPE,
};

// init code
class AppBuilder extends HTMLElement {
  connectedCallback() {
    this.style.height = '100%';
    this.style.width = '100%';
    this.style.display = 'flex';
    this.style.flex = '1';
    AppRegistry.registerComponent('App', () => AppBuilderView);
    AppRegistry.runApplication('App', {
      // initialProps: {passphrase: this.getAttribute('passphrase')},
      rootTag: this,
    });
  }
}

customElements.define('app-builder', AppBuilder);

export default AppBuilderMethods;

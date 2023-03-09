import {AppRegistry} from 'react-native';
import SDKAppWrapper, {
  AppBuilderSdkApi,
  AppBuilderSdkApiInterface,
} from './src/SDKAppWrapper';
import SDKEvents from './src/utils/SdkEvents';
import React from 'react';
import * as RN from 'react-native-web';
import './src/assets/font-styles.css';
export * from 'customization-api';
export * from 'customization-implementation';

interface AppBuilderWebSdkInterface extends AppBuilderSdkApiInterface {}

const clearEvent = {
  clear: () => {},
};

const AppBuilderWebSdkApi: AppBuilderWebSdkInterface = {
  ...AppBuilderSdkApi,
  // Override customize function for web-sdk
  customize: (customization) => {
    SDKEvents.emit('addFpe', customization);
    clearEvent.clear = SDKEvents.on('addFpeInit', () => {
      console.log('addFpeInit called');
      SDKEvents.emit('addFpe', customization);
      clearEvent.clear();
    });
  },
};

// init code
class AppBuilder extends HTMLElement {
  connectedCallback() {
    this.style.height = '100%';
    this.style.width = '100%';
    this.style.display = 'flex';
    this.style.flex = '1';
    AppRegistry.registerComponent('App', () => SDKAppWrapper);
    AppRegistry.runApplication('App', {
      // initialProps: {passphrase: this.getAttribute('passphrase')},
      rootTag: this,
    });
  }
}

customElements.define('app-builder', AppBuilder);

export {React, RN};
export default AppBuilderWebSdkApi;

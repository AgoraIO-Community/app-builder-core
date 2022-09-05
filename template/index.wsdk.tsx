import {AppRegistry} from 'react-native';
import SDKAppWrapper, {
  AppBuilderSdkApi,
  AppBuilderSdkApiInterface,
} from './src/SDKAppWrapper';
import React from 'react';
import * as RN from 'react-native-web';
import jsonFile from './config.json';

export * from 'fpe-api';
export * from 'fpe-implementation';

interface AppBuilderWebSdkInterface extends AppBuilderSdkApiInterface {}

const AppBuilderWebSdkApi: AppBuilderWebSdkInterface = AppBuilderSdkApi;

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

let config: ConfigInterface = jsonFile as unknown as ConfigInterface;

export {React, RN, config};
export default AppBuilderWebSdkApi;

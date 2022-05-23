import {AppRegistry} from 'react-native';
import {FpeApiInterface} from 'fpe-api';
import {SDKEvents} from './src/utils/SdkEvents';
import {installFPE as createFPE} from 'fpe-api/install';
import SDKAppWrapper from './src/SDKAppWrapper';
export * as FpeApi from 'fpe-api';

interface AppBuilderMethodsInterface {
  addFPE: (fpe: FpeApiInterface) => void;
  createFPE: (fpe: FpeApiInterface) => FpeApiInterface;
}

const AppBuilderMethods: AppBuilderMethodsInterface = {
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
    AppRegistry.registerComponent('App', () => SDKAppWrapper);
    AppRegistry.runApplication('App', {
      // initialProps: {passphrase: this.getAttribute('passphrase')},
      rootTag: this,
    });
  }
}

customElements.define('app-builder', AppBuilder);

export default AppBuilderMethods;

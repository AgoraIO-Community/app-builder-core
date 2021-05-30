/**
 * @format
 */

import {AppRegistry} from 'react-native';
import * as Sentry from '@sentry/react-native';
import App from './src/App';
import {name as appName} from './app.json';

Sentry.init({
  dsn: 'https://b5df0450fe284baa8376e62ace331580@o615358.ingest.sentry.io/5749898',
});
AppRegistry.registerComponent(appName, () => App);

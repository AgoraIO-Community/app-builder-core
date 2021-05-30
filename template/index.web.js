import {AppRegistry} from 'react-native';
import * as Sentry from '@sentry/browser';
import Video from './src/App';

Sentry.init({
  dsn: 'https://b5df0450fe284baa8376e62ace331580@o615358.ingest.sentry.io/5749898',
});

AppRegistry.registerComponent('App', () => Video);

AppRegistry.runApplication('App', {
  initialProps: {},
  rootTag: document.getElementById('react-app'),
});

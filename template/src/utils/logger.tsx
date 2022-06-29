import {Platform} from 'react-native';
import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';
import config from '../../config.json';
import pkg from '../../package.json';
import getUserId from './getUserId';
import ReadLogFiles from './logFileReader';
import {
  logger as ReactNativeLogger,
  transportFunctionType,
} from 'react-native-logs';

export const identityTags = {
  // Generate for every new session
  session_id: uuid(),
  // Persisted for user across sessions
  user_id: getUserId(),
};

export const commonMetadata = {
  app_id: $config.APP_ID,
  core_version: pkg.version,
  config: {...config, LOGO: null, ICON: null, BG: null},
  // Fpe customisation/overrides serialized into true/false
  fpe: {components: {create: true}},
};

var default_console = {...console};

const customConsoleTransport: transportFunctionType = ({
  msg,
  rawMsg,
  level,
}) => {
  // rawMsg used instead of msg to preserve nice to haves like object collapsing
  // and default formating which is lost in the `msg` parameter due to it being
  // pre-stringified by the logging library
  if (Platform.OS === 'web') {
    if (level.text === 'debug') {
      default_console.log(...rawMsg);
    } else {
      default_console[level.text as keyof Console](...rawMsg);
    }
    // default_console.log(...rawMsg,level.text);
  } else {
    default_console.log(msg);
  }
};

const logger = ReactNativeLogger.createLogger({
  transport: customConsoleTransport,
});
logger.log = logger.debug;

// Console override
console.log = (...data: any) => {
  // default_console.log('Hijacked', ...data);
  logger.debug(...data);
};
// ----------------

// Native log files read
if (Platform.OS !== 'web') setTimeout(ReadLogFiles, 1000);
// ----------------

export default logger;

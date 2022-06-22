import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import config from '../../config.json';
import pkg from '../../package.json';

interface metaDataInterface {
  [key: string]: any;
}

export const commonMetadata = {
  session_id: uuidv4(),
  app_id: $config.APP_ID,
  core_version: pkg.version,
  config: {...config, LOGO: null, ICON: null, BG: null},
};

enum logLevelEnum {
  LOG = 'LOG',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARN',
  ERROR = 'ERROR',
}

export enum transportsEnum {
  Diagnostics,
  Analytics,
  Development,
}

type transportLogFunctionType = (
  logLevel: logLevelEnum,
  message: any,
  metadata: any,
) => void;

type emitLogFunctionType = (...message: any) => void;

interface initLoggerInterface {
  transport?: transportsEnum;
  metadata?: metaDataInterface;
}

class Logger {
  constructor() {
    this.transport = () => {};
    this.metadata = {};
  }
  init: (p: initLoggerInterface) => void = (config) => {
    if (config.transport) {
      this.transport = transports[config.transport];
    } else {
      this.transport = transports[transportsEnum.Development];
    }
    if (config.metadata) {
      this.metadata = config.metadata;
    }
  };
  metadata: metaDataInterface = {};
  setMetadata(param: metaDataInterface): void;
  setMetadata(param: (metadata: metaDataInterface) => metaDataInterface): void {
    if (typeof param === 'object') {
      this.metadata = param;
    } else {
      this.metadata = param(this.metadata);
    }
  }
  transport: transportLogFunctionType;
  log: emitLogFunctionType = (...message) => {
    this.transport(logLevelEnum.LOG, message, this.metadata);
  };
  info: emitLogFunctionType = (...message) => {
    this.transport(logLevelEnum.INFO, message, this.metadata);
  };
  debug: emitLogFunctionType = (...message) => {
    this.transport(logLevelEnum.DEBUG, message, this.metadata);
  };
  warn: emitLogFunctionType = (...message) => {
    this.transport(logLevelEnum.WARNING, message, this.metadata);
  };
  error: emitLogFunctionType = (...message) => {
    this.transport(logLevelEnum.ERROR, message, this.metadata);
  };
}

const transports: {
  [key in transportsEnum]: transportLogFunctionType;
} = {
  [transportsEnum.Diagnostics]: (logLevel, message, metadata) => {
    console.log('I am Diagnostics', logLevel, message, metadata);
  },
  [transportsEnum.Analytics]: (logLevel, message, metadata) => {
    console.log('I am analytics', logLevel, message, metadata);
  },
  [transportsEnum.Development]: (logLevel, message, metadata) => {
    let log = console[logLevel.toLowerCase() as keyof Console];
    log(logLevel, ...message, metadata);
  },
};

let logger = new Logger();

export default logger;

import {nanoid} from 'nanoid';
import {version as core_version} from '../../../package.json';
import config from '../../../config.json';

/** The App environment */
export type Environment = 'development' | 'production';

/** Metadata Info interface */
interface MetaInfo {
  env: string;
  timestamp: number;
  session_id: string;
  core_version: string;
  region: string;
  app_id: string;
  project_id: string;
  vertical: string;
  sdk_version: {
    rtm: string;
    rtc: string;
  };
  OS: string;
  config: any;
  // navigator: Navigator;
}

/** CallData Info interface */
interface CallInfo {
  passphrase: string;
  channelId: string;
  uid: number;
  screenShareUid: number;
  role: string;
  // traceId: ??
  // config.json???
}

/** Log levels */
export type LogLevel = 'log' | 'warn' | 'error' | 'info';

/** Signature of a logging function */
export interface LogFn {
  (message?: any, ...optionalParams: any[]): void;
}

// const NO_OP: LogFn = (message?: any, ...optionalParams: any[]) => {};

/** Basic logger interface */
export interface Logger {
  log: LogFn;
  // warn: LogFn;
  // error: LogFn;
  // info: LogFn;
  init: (options: MetaInfo) => void;
  setCallInfo: (options: CallInfo) => void;
  // _log: any;
  // specialLog: any;
}

/** Logger which outputs to the browser console */
class AppBuilderLogger implements Logger {
  readonly transport: LogFn;
  metaInfo: Partial<MetaInfo> = {};
  callInfo: Partial<CallInfo> = {};
  heading = '%cAppBuilder-Logger';

  constructor() {
    // this._log = Function.prototype.bind.call(console.log, console);
    // const {level} = options || {};
    // error
    // this.error = console.error.bind(console);
    // warn
    // this.warn = console.warn.bind(console);

    // log method
    // this.log = console.log.bind(
    //   console,
    //   `${this.heading}`,
    //   `${this.css} %s %o`,
    // );
    // this._log = this._log.bind(this.log);

    this.metaInfo = {};
    // this.transport = (logLevel, message, metadata) => {
    //   let log = console[logLevel.toLowerCase() as keyof Console];
    //   log(logLevel, message, metadata);
    // };
  }

  init = (options?: Partial<MetaInfo>) => {
    this.metaInfo = {
      env: 'development',
      timestamp: Date.now(),
      session_id: nanoid(),
      region: '',
      app_id: $config.APP_ID,
      project_id: $config.PROJECT_ID,
      vertical: 'conferencing',
      core_version,
      config: {...config},
      ...options,
    };
  };

  log(message: string, _options?: any) {
    const css = 'color: rgb(9, 157, 253); font-weight: bold';
    console.log(`${this.heading}`, `${css} %s`, message, {
      metaInfo: this.metaInfo,
      callInfo: this.callInfo,
    });
    // this.transport('LOG', message, this.metaInfo);
  }

  setCallInfo() {
    console.log('supriya inside setCallInfo');
  }
}

export const logger = new AppBuilderLogger();

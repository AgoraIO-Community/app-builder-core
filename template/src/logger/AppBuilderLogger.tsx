import {nanoid} from 'nanoid';
import pkg from '../../package.json';
import {isWeb} from '../utils/common';
import {version as cli_version} from '../../../package.json';
import {ENABLE_AGORA_TRANSPORT, ENABLE_BROWSER_CONSOLE_LOGS} from './contants';
import {initTransportLayerForAgora} from './transports/agora-transport';
import configJSON from '../../config.json';

export declare const StatusTypes: {
  readonly debug: 'debug';
  readonly error: 'error';
  readonly info: 'info';
  readonly warn: 'warn';
};

export type StatusType = (typeof StatusTypes)[keyof typeof StatusTypes];

export enum LogSource {
  AgoraSDK = 'Agora-SDK',
  /** Logs related to all features */
  Internals = 'Internals',
  /** Logs related to REST API calls */
  NetworkRest = 'Network-REST',
  /** Logs related to Events */
  Events = 'Events',
  /** Logs related to Customization API */
  CustomizationAPI = 'Customization',
  /** Logs related to SDK */
  SDK = 'SDK',
}

type LogType = {
  [LogSource.AgoraSDK]: 'Log' | 'API' | 'Event' | 'Service';
  [LogSource.Internals]:
    | 'AUTH'
    | 'CREATE_MEETING'
    | 'ENTER_MEETING_ROOM'
    | 'JOIN_MEETING'
    | 'PRECALL_SCREEN'
    | 'DEVICE_CONFIGURE'
    | 'LOCAL_MUTE'
    | 'VIRTUAL_BACKGROUND'
    | 'VIDEO_CALL_ROOM'
    | 'LANGUAGE'
    | 'CONTROLS'
    | 'CHAT'
    | 'NAME'
    | 'STT'
    | 'SCREENSHARE'
    | 'WHITEBOARD'
    | 'LAYOUT'
    | 'TRANSCRIPT'
    | 'NOISE_CANCELLATION'
    | 'ACTIVE_SPEAKER'
    | 'WAITING_ROOM'
    | 'RECORDING'
    | 'STORE';
  [LogSource.NetworkRest]:
    | 'idp_login'
    | 'token_login'
    | 'unauth_login'
    | 'idp_logout'
    | 'token_logout'
    | 'user_details'
    | 'createChannel'
    | 'joinChannel'
    | 'channel_join_request'
    | 'channel_join_approval'
    | 'stt'
    | 'whiteboard_image'
    | 'whiteboard_upload'
    | 'whiteboard_fileconvert'
    | 'recording_start'
    | 'recording_stop'
    | 'recordings_get';
  [LogSource.Events]: 'CUSTOM_EVENTS' | 'RTM_EVENTS';
  [LogSource.CustomizationAPI]: 'Log';
  [LogSource.SDK]: 'Log' | 'Event';
};

/** Log levels */
export type LogLevel = 'log' | 'warn' | 'error' | 'info';

/** Signature of a logging function */
type LogFn = <T extends LogSource>(
  source: T,
  type: LogType[T],
  logMessage: string,
  ...data: any[]
) => void;

// const NO_OP: LogFn = (message?: any, ...optionalParams: any[]) => {};

/** Basic logger interface */
export interface Logger {
  log: LogFn;
  warn: LogFn;
  error: LogFn;
  info: LogFn;
  debug: LogFn;
}

/** Logger which outputs to the browser console */
export default class AppBuilderLogger implements Logger {
  log: LogFn;
  info: LogFn;
  warn: LogFn;
  debug: LogFn;
  error: LogFn;

  constructor(_customTransport?: any) {
    const session = nanoid();
    const rtmPkg = isWeb()
      ? pkg.dependencies['agora-rtm-sdk']
      : pkg.dependencies['agora-react-native-rtm'];
    const rtcPkg = isWeb()
      ? pkg.dependencies['agora-rtc-sdk-ng']
      : pkg.dependencies['react-native-agora'];
    const logger =
      (status: StatusType) =>
      <T extends LogSource>(
        source: T,
        type: LogType[T],
        logMessage: string,
        ...data: any[]
      ) => {
        if (!$config.LOG_ENABLED) {
          return;
        }
        const context = {
          timestamp: Date.now(),
          source,
          type,
          data,
          contextInfo: {
            env: process.env.NODE_ENV,
            session_id: session,
            app_id: $config.APP_ID,
            project_id: $config.PROJECT_ID,
            sdk_version: {
              rtm: rtmPkg,
              rtc: rtcPkg,
            },
            version: cli_version,
          },
        };

        const consoleHeader = `%cApp-Builder: ${source}:[${type}] `;
        const consoleCSS = 'color: violet; font-weight: bold';
        if (_customTransport) {
          /**
           *  Datadog logger API format
           *  logger.debug | info | warn | error (message: string, messageContext?: Context, error?: Error)
           */
          _customTransport[status](
            logMessage,
            context,
            status,
            status === 'error' ? data[0] : undefined,
          );
        }
        if (ENABLE_BROWSER_CONSOLE_LOGS) {
          console[status](
            consoleHeader,
            consoleCSS,
            logMessage,
            context,
            status,
          );
        }
      };

    this.log = logger('info');
    this.info = logger('info');
    this.debug = logger('debug');
    this.warn = logger('warn');
    this.error = logger('error');

    this.log(LogSource.Internals, 'AUTH', 'App intitialized with config.json', {
      config: configJSON,
    });
  }
}

let transport = null;

if (ENABLE_AGORA_TRANSPORT) {
  transport = initTransportLayerForAgora();
}

export const logger = new AppBuilderLogger(transport);

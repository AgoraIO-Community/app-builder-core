import 'react-native-get-random-values';
import {nanoid} from 'nanoid';
import pkg from '../../package.json';
import {isWeb, isWebInternal} from '../utils/common';
import {
  ENABLE_AGORA_LOGGER_TRANSPORT,
  ENABLE_BROWSER_CONSOLE_LOGS,
  ENABLE_CUSTOMER_LOGGER_TRANSPORT,
} from './constants';
import {
  getTransportLogger,
  initTransportLayerForAgora,
} from './transports/agora-transport';
import configJSON from '../../config.json';
import {getPlatformId} from '../auth/config';
import {
  initTransportLayerForCustomers,
  sendLogs,
} from './transports/customer-transport';

const cli_version = $config.CLI_VERSION;
const core_version = $config.CORE_VERSION;

export type CustomLogger = (
  message: string,
  type: StatusType,
  columns?: Object,
  contextInfo?: Object,
  data?: any,
) => void;

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
    | 'SET_MEETING_DETAILS'
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
    | 'STORE'
    | 'GET_MEETING_PHRASE'
    | 'MUTE_PSTN'
    | 'FULL_SCREEN';
  [LogSource.NetworkRest]:
    | 'idp_login'
    | 'token_login'
    | 'unauth_login'
    | 'idp_logout'
    | 'token_logout'
    | 'token_refresh'
    | 'user_details'
    | 'createChannel'
    | 'joinChannel'
    | 'channel_join_request'
    | 'channel_join_approval'
    | 'stt'
    | 'whiteboard_get_s3_signed_url'
    | 'whiteboard_get_s3_upload_url'
    | 'whiteboard_s3_upload'
    | 'whiteboard_fileconvert'
    | 'whiteboard_screenshot'
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
  private _customLogger: CustomLogger;
  private _session;
  constructor(_transportLogger?: any) {
    this._session = nanoid();
    const platform = getPlatformId();
    const rtmPkg = isWeb()
      ? pkg.dependencies['agora-rtm-sdk']
      : pkg.dependencies['agora-react-native-rtm'];
    const rtcPkg = isWeb()
      ? pkg.dependencies['agora-rtc-sdk-ng']
      : pkg.dependencies['react-native-agora'];
    let roomInfo = {
      meeting_title: '',
      channel_id: '',
      host_id: '',
      attendee_id: '',
      user_id: '',
    };
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
        if (type === 'SET_MEETING_DETAILS') {
          roomInfo = {...data[0]};
        }
        let columns = {
          timestamp: Date.now(),
          source,
          type,
          platform,
          user_id: roomInfo?.user_id,
          app_builder_session_id: this._session,
          channel_id: roomInfo?.channel_id,
          host_id: roomInfo?.host_id,
          attendee_id: roomInfo?.attendee_id,
        };

        const contextInfo = {
          agora_sdk_version: {
            rtm: rtmPkg,
            rtc: rtcPkg,
          },
          appbuilder_version: {
            cli: cli_version,
            core: core_version,
          },
          meeting_title: roomInfo?.meeting_title,
        };

        if (isWebInternal() && window) {
          //@ts-ignore
          window.APP_BUILDER = {
            //need to store CORE version and CLI version
            app_id: $config.APP_ID,
            project_id: $config.PROJECT_ID,
            user_id: roomInfo?.user_id,
            session_id: this._session,
            channel_id: roomInfo?.channel_id,
            host_id: roomInfo?.host_id,
            attendee_id: roomInfo?.attendee_id,
            contextInfo: contextInfo,
          };
        }

        try {
          if (ENABLE_CUSTOMER_LOGGER_TRANSPORT) {
            if (this._customLogger) {
              this._customLogger(
                logMessage,
                status,
                columns,
                contextInfo,
                data,
              );
            } else if (_transportLogger) {
              if (type === 'recording_stop') {
                sendLogs([
                  {
                    _time: Date.now(),
                    projectId: $config.PROJECT_ID,
                    appId: $config.APP_ID,
                    service: 'app-builder-core-frontend-customer',
                    logType: status,
                    logMessage: logMessage,
                    ...columns,
                    contextInfo,
                    logContent: data,
                  },
                ]);
              } else {
                _transportLogger(
                  logMessage,
                  status,
                  columns,
                  contextInfo,
                  data,
                );
              }
            }
          }
          if (ENABLE_AGORA_LOGGER_TRANSPORT && _transportLogger) {
            _transportLogger(logMessage, status, columns, contextInfo, data);
          }
        } catch (error) {
          console.log(
            `error occured whhile trasnporting log for project : ${$config.PROJECT_ID}`,
            error,
          );
        }

        if (ENABLE_BROWSER_CONSOLE_LOGS || status === 'debug') {
          const consoleHeader = `%cApp-Builder: ${source}:[${type}] `;
          const consoleCSS = 'color: violet; font-weight: bold';

          console[status](
            consoleHeader,
            consoleCSS,
            logMessage,
            {...columns, contextInfo, logContent: data},
            status,
          );
        }
      };

    this.log = logger('info');
    this.info = logger('info');
    this.debug = logger('debug');
    this.warn = logger('warn');
    this.error = logger('error');

    this.debug(
      LogSource.Internals,
      'AUTH',
      'App intitialized with config.json',
      configJSON,
    );
  }

  getSessionId = () => {
    return this._session;
  };

  setCustomLogger = (_customLogger: CustomLogger) => {
    this._customLogger = _customLogger;
    _customLogger(
      'App intitialized with config.json',
      'debug',
      {},
      {},
      {
        config: configJSON,
      },
    );
  };
}

let _transportLogger = null;

if (ENABLE_AGORA_LOGGER_TRANSPORT) {
  initTransportLayerForAgora();
  _transportLogger = getTransportLogger();
}

if (ENABLE_CUSTOMER_LOGGER_TRANSPORT) {
  _transportLogger = initTransportLayerForCustomers();
}

export const logger = new AppBuilderLogger(_transportLogger);

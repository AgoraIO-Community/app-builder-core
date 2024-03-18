import {nanoid} from 'nanoid';
import {
  version as core_version,
  name as vertical_name,
} from '../../../package.json';
import config from '../../../config.json';
import {RoomData as RoomInfo} from '../components/room-info/useRoomInfo';

export declare const StatusTypes: {
  readonly debug: 'debug';
  readonly error: 'error';
  readonly info: 'info';
  readonly warn: 'warn';
};

export type StatusType = (typeof StatusTypes)[keyof typeof StatusTypes];

export enum LogSource {
  AgoraSDK = 'Agora-SDK',
  UserEvent = 'User-Event',
  Auth = 'Auth',
  /** Logs related to REST API calls */
  NetworkRest = 'Network-REST',
}

type LogType = {
  [LogSource.AgoraSDK]: 'Log' | 'API' | 'Event' | 'Service';
  [LogSource.Auth]: 'Auth';
  [LogSource.UserEvent]:
    | 'LANDED_CREATE_SCREEN'
    | 'CREATE_MEETING'
    | 'ENTER_MEETING_ROOM'
    | 'JOIN_MEETING';
  [LogSource.NetworkRest]:
    | 'idp_login'
    | 'token_login'
    | 'unauth_login'
    | 'idp_logout'
    | 'token_logout'
    | 'user_details'
    | 'createChannel';
};

/** The App environment */
export type Environment = 'development' | 'production';

interface AppInfo {
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
}
/** CallData Info interface */
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
/** Metadata Info interface */
interface ContextInfo {
  appInfo: AppInfo;
  roomInfo: Partial<RoomInfo>;
  callInfo: CallInfo;
}

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
class AppBuilderLogger implements Logger {
  heading = '%cAppBuilder-Logger';
  log: LogFn;
  info: LogFn;
  warn: LogFn;
  debug: LogFn;
  error: LogFn;
  callInfo: Partial<CallInfo> = {};
  roomInfo: Partial<RoomInfo> = {};

  constructor(contextInfo?: Partial<ContextInfo>, _customTransport?: any) {
    const logger =
      (status: StatusType) =>
      <T extends LogSource>(
        source: T,
        type: LogType[T],
        logMessage: string,
        ...data: any[]
      ) => {
        if (status === 'debug') {
          return;
        }
        const context = {
          session_id: nanoid(),
          timestamp: Date.now(),
          source,
          type,
          data,
          contextInfo: {
            appInfo: {
              env: 'development',
              timestamp: Date.now(),
              session_id: nanoid(),
              region: '',
              app_id: $config.APP_ID,
              project_id: $config.PROJECT_ID,
              vertical: vertical_name,
              core_version,
              config: {...config},
              ...contextInfo,
            },
            callInfo: this.callInfo,
            roomInfo: this.roomInfo,
          },
        };
        const consoleHeader =
          source === LogSource.AgoraSDK
            ? `%c${source}:[${type}] `
            : `%cApp-Builder: ${source}:[${type}] `;

        const consoleCSS =
          source === LogSource.AgoraSDK
            ? 'color: rgb(9, 157, 253); font-weight: bold'
            : 'color: violet; font-weight: bold';

        _customTransport
          ? _customTransport(logMessage, context, status)
          : console[status](
              consoleHeader,
              consoleCSS,
              logMessage,
              context,
              status,
            );
      };

    this.log = logger('info');
    this.info = logger('info');
    this.debug = logger('debug');
    this.warn = logger('warn');
    this.error = logger('error');
  }

  setCallInfo = (info: Partial<CallInfo>) => {
    this.callInfo = {
      passphrase: info.passphrase,
      channelId: info.channelId,
      uid: info.uid,
      screenShareUid: info.screenShareUid,
      role: info.role,
    };
  };
  setRoomInfo = (info: Partial<RoomInfo>) => {
    this.roomInfo = {
      ...this.roomInfo,
      ...info,
    };
  };
}

export const logger = new AppBuilderLogger();

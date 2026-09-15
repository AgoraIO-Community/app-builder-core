import {StatusType, datadogLogs} from '@datadog/browser-logs';

const DATADOG_CLIENT_TOKEN = 'pubad10d7feb87f0b039c267e69b46ee84e';
const DATADOG_SITE = 'datadoghq.com';

export const initTransportLayerForAgora = () => {
  datadogLogs.init({
    clientToken: DATADOG_CLIENT_TOKEN,
    site: DATADOG_SITE,
    forwardErrorsToLogs: false,
    sessionSampleRate: 100,
    service: 'app-builder-core-frontendv2',
    env: 'none',
  });
};

export const getTransportLogger = () => {
  return (
    logMessage: string,
    logType: StatusType,
    columns: Object,
    contextInfo: Object,
    logContent: any[],
  ) => {
    const primaryLogContent =
      logContent?.length === 1 &&
      logContent[0] &&
      typeof logContent[0] === 'object'
        ? logContent[0]
        : undefined;
    const datadogLogContent = primaryLogContent?.screenshareSessionId
      ? primaryLogContent
      : logContent;

    datadogLogs.logger.log(
      logMessage,
      {
        ...columns,
        logMessage,
        logType,
        contextInfo,
        logContent: datadogLogContent,
      },
      logType,
      logType === 'error' ? primaryLogContent : undefined,
    );
  };
};

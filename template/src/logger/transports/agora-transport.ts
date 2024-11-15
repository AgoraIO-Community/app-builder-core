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
    datadogLogs.logger.log(
      logMessage,
      {...columns, logMessage, logType, contextInfo, logContent},
      logType,
      logType === 'error'
        ? logContent?.length
          ? logContent[0]
          : undefined
        : undefined,
    );
  };
};

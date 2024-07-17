import {StatusType, datadogLogs} from '@datadog/browser-logs';
import {version as cli_version} from '../../../../package.json';

const DATADOG_CLIENT_TOKEN = 'pubad10d7feb87f0b039c267e69b46ee84e';
const DATADOG_SITE = 'datadoghq.com';

export const initTransportLayerForAgora = () => {
  datadogLogs.init({
    clientToken: DATADOG_CLIENT_TOKEN,
    site: DATADOG_SITE,
    forwardErrorsToLogs: false,
    sessionSampleRate: 100,
    service: 'app-builder-core-frontendv2',
    version: cli_version,
    env: 'none',
  });
};

export const getTransportLogger = () => {
  return (
    logMessage: string,
    logType: StatusType,
    columns,
    contextInfo,
    logContent,
  ) => {
    datadogLogs.logger.log(
      logMessage,
      {columns, contextInfo, logContent},
      logType,
      //logType === 'error' ? data[0] : undefined,
    );
  };
};

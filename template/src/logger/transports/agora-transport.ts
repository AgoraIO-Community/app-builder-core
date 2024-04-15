import {datadogLogs} from '@datadog/browser-logs';
import {version as cli_version} from '../../../../package.json';

const DATADOG_CLIENT_TOKEN = 'pubeccdaed5357d217e2c75e85aaef432fe';
const DATADOG_SITE = 'datadoghq.com';

console.log('process.env.NODE_ENV', process.env.NODE_ENV);
export const initTransportLayerForAgora = () => {
  datadogLogs.init({
    clientToken: DATADOG_CLIENT_TOKEN,
    site: DATADOG_SITE,
    forwardErrorsToLogs: true,
    sessionSampleRate: 100,
    service: 'app-builder-core-frontend',
    version: cli_version,
    env: process.env.NODE_ENV,
  });
  return datadogLogs.logger;
};
// logger.debug | info | warn | error (message: string, messageContext?: Context, error?: Error)

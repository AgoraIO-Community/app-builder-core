import {StatusType} from '@datadog/browser-logs';
import {
  BatchSize,
  DatadogProvider,
  DatadogProviderConfiguration,
  SdkVerbosity,
  DdLogs,
  UploadFrequency,
} from '@datadog/mobile-react-native';

export const initTransportLayerForAgora = () => {
  console.log(
    'Initialized the logger in index entry file for native platforms ',
  );
};

const getConfig = () => {
  const loggerConfig = new DatadogProviderConfiguration(
    'pub5b520008af91c772f322121cb2adc81c',
    'none',
    'fc33ae27-6fd6-4c7b-94c6-c2c11b9f565e', // application ID
    true, // track User interactions (e.g.: Tap on buttons. You can use 'accessibilityLabel' element property to give tap action the name, otherwise element type will be reported)
    true, // track XHR Resources
    true, // track Errors
  );
  // Optional: Select your Datadog website (one of "US1", "EU1", "US3", "US5", "AP1" or "GOV")
  loggerConfig.site = 'US1';
  // Optional: Enable JavaScript long task collection
  loggerConfig.longTaskThresholdMs = 100;
  // Optional: enable or disable native crash reports
  loggerConfig.nativeCrashReportEnabled = true;
  // Optional: sample RUM sessions (here, 100% of session will be sent to Datadog. Default = 100%)
  loggerConfig.sampleRate = 100;
  // Optional: The service name for your application
  loggerConfig.serviceName = 'app-builder-core-frontend-nativev2';

  if (__DEV__) {
    // Optional: Send data more frequently
    loggerConfig.uploadFrequency = UploadFrequency.FREQUENT;
    // Optional: Send smaller batches of data
    loggerConfig.batchSize = BatchSize.SMALL;
    // Optional: Enable debug logging
    loggerConfig.verbosity = SdkVerbosity.DEBUG;
  }
  return loggerConfig;
};

const getTransportLogger = () => {
  return (
    logMessage: string,
    logType: StatusType,
    columns: Object,
    contextInfo: Object,
    logContent: Object,
  ) => {
    if (logType === 'error') {
      DdLogs.error(logMessage, {...columns, contextInfo, logContent});
    } else {
      DdLogs.debug(logMessage, {...columns, contextInfo, logContent});
    }
  };
};

export {DatadogProvider, getTransportLogger, getConfig};

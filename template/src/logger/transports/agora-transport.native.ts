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
  const config = new DatadogProviderConfiguration(
    'pubdb41371dc4efb3e57a918a4f2096578c',
    'none',
    'fc33ae27-6fd6-4c7b-94c6-c2c11b9f565e',
    true, // track User interactions (e.g.: Tap on buttons. You can use 'accessibilityLabel' element property to give tap action the name, otherwise element type will be reported)
    true, // track XHR Resources
    true, // track Errors
  );
  // Optional: Select your Datadog website (one of "US1", "EU1", "US3", "US5", "AP1" or "GOV")
  config.site = 'US1';
  // Optional: Enable JavaScript long task collection
  config.longTaskThresholdMs = 100;
  // Optional: enable or disable native crash reports
  config.nativeCrashReportEnabled = true;
  // Optional: sample RUM sessions (here, 100% of session will be sent to Datadog. Default = 100%)
  config.sampleRate = 100;
  // Optional: The service name for your application
  config.serviceName = 'app-builder-core-frontend-native';

  if (__DEV__) {
    // Optional: Send data more frequently
    config.uploadFrequency = UploadFrequency.FREQUENT;
    // Optional: Send smaller batches of data
    config.batchSize = BatchSize.SMALL;
    // Optional: Enable debug logging
    config.verbosity = SdkVerbosity.DEBUG;
  }
  return config;
};

const getTransportLogger = () => {
  return (text: string, data: any, status: StatusType) => {
    if (status === 'error') {
      DdLogs.error(text, data);
    } else {
      DdLogs.debug(text, data);
    }
  };
};

export {DatadogProvider, getTransportLogger};

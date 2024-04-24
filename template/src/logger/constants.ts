const CONFERENCING_APP_ID = 'b8c2ef0f986541a8992451c07d30fb4b';

// Send logs to configured transport-> Datadog (used for internal app - www.confercning.agora.io)
// Use the app id strict check to keep this true
export const ENABLE_AGORA_LOGGER_TRANSPORT = $config.LOG_ENABLED && true;
// $config.LOG_ENABLED && $config.APP_ID === CONFERENCING_APP_ID && true;

// Send logs to configured transport-> axiom (used for customer deployed apps)
export const ENABLE_CUSTOMER_LOGGER_TRANSPORT = $config.LOG_ENABLED && false;

// Print logs to browser console window - true in dev mode
export const ENABLE_BROWSER_CONSOLE_LOGS =
  $config.LOG_ENABLED && process.env.NODE_ENV === 'development';

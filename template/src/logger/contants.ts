// Send logs to configured transport-> Datadog (used for internal app - www.confercning.agora.io)
export const ENABLE_AGORA_LOGGER_TRANSPORT = $config.LOG_ENABLED && true;

// Send logs to configured transport-> axiom (used for customer deployed apps)
export const ENABLE_CUSTOMER_LOGGER_TRANSPORT = $config.LOG_ENABLED && false;

// Print logs to browser console window
export const ENABLE_BROWSER_CONSOLE_LOGS = $config.LOG_ENABLED && true;

import {
  CustomizationLogType,
  LogSource,
  logger,
} from '../src/logger/AppBuilderLogger';

export type CustomizationLogLevel = 'debug' | 'info' | 'warn' | 'error';
export type CustomizationLogData = Record<string, unknown>;
export type CustomizationLogEvent = {
  type: CustomizationLogType;
  event: string;
  data?: CustomizationLogData;
  level?: CustomizationLogLevel;
};

/**
 * Sends a customization event through the active App Builder log transport.
 * The logger adds the current session, room, user, platform, and SDK context.
 * Callers must redact credentials and other sensitive values before logging.
 */
export const logCustomizationEvent = ({
  type,
  event,
  data,
  level = 'info',
}: CustomizationLogEvent) => {
  if (data) {
    logger[level](LogSource.CustomizationAPI, type, event, data);
    return;
  }

  logger[level](LogSource.CustomizationAPI, type, event);
};

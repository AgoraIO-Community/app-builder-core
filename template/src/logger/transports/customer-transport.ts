import createRetryFetch from 'fetch-retry';
import {isWeb} from '../../utils/common';

/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value#examples */
export function getCircularReplacer() {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
}

const getSafeBody = (p: any[]) => {
  try {
    return JSON.stringify(p, getCircularReplacer());
  } catch (error) {
    console.error('there was an error converting this object', p);
    return ['object conversion error'];
  }
};

const fetchRetry = createRetryFetch(fetch, {
  retries: 23,
  retryDelay: function (attempt) {
    return Math.pow(2, attempt) * 1000; // 1000, 2000, 4000
  },
  retryOn: function (attempt, error, response) {
    // retry on any network error, or 4xx or 5xx status codes
    if (error !== null || response.status > 400) {
      return true;
    }
  },
});

export const sendLogs = (p: any[]) => {
  if (p && p.length) {
    fetchRetry(
      'https://axiom-queue.appbuilder.workers.dev?dataset=app-builder-core-frontend-customer',
      {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: getSafeBody(p),
      },
    ).catch(err => {
      console.log('error occurred while replacing circular reference', p, err);
    });
  } else {
    console.log('queue is empty, no logs available to send');
  }
};

export const createAxiomLogger = () => {
  const queue: any[] = [];
  let batchId = 0;
  let timeout: number | null = null;

  const sendInterval = 30000; // 30s

  const flush = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    if (queue.length === 0) {
      return;
    }
    sendLogs(queue);
    queue.length = 0;
    batchId++;
  };

  const log = (logContent: {[key: string]: any}) => {
    logContent.batchId = batchId;
    queue.push(logContent);
    if (queue.length >= 500) {
      flush();
    } else {
      if (timeout === null) {
        timeout = window.setTimeout(() => {
          flush();
        }, sendInterval);
      }
    }
  };

  return [log, flush] as const;
};

export const initTransportLayerForCustomers = () => {
  const [log, flush] = createAxiomLogger();

  const printLogs = (logMessage, logType, columns, contextInfo, logContent) => {
    log({
      _time: Date.now(),
      projectId: $config.PROJECT_ID,
      appId: $config.APP_ID,
      service: 'app-builder-core-frontend-customer',
      logType,
      logMessage,
      logContent,
      contextInfo,
      ...columns,
    });

    if (isWeb()) {
      const beforeUnloadHandler = () => {
        flush();
        window.removeEventListener('beforeunload', beforeUnloadHandler);
      };
      window.addEventListener('beforeunload', beforeUnloadHandler);
    }
  };
  return printLogs;
};

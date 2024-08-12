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
  // const ancestors = [];
  // return function (key, value) {
  //   if (typeof value !== 'object' || value === null) {
  //     return value;
  //   }
  //   // `this` is the object that value is contained in,
  //   // i.e., its direct parent.
  //   while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) {
  //     ancestors.pop();
  //   }
  //   if (ancestors.includes(value)) {
  //     return '[Circular]';
  //   }
  //   ancestors.push(value);
  //   return value;
  // };
}

function getTopLevels(obj, level = 1, maxLevel = 4) {
  if (level > maxLevel || typeof obj !== 'object' || obj === null) {
    return ['MaxLevelExceeds'];
  }
  const result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (key === 'logContent') {
          result[key] = [obj[key]];
        } else {
          result[key] = getTopLevels(obj[key], level + 1, maxLevel);
        }
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

const getSafeBody = (p: any[]) => {
  try {
    const logResult = [];
    for (let index = 0; index < p.length; index++) {
      const element = p[index];
      logResult.push(getTopLevels(element));
    }
    return JSON.stringify(logResult);
  } catch (error) {
    console.error('there was an error converting this object', error, p);
    return ['object convertion error'];
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
  if (p && p?.length) {
    fetchRetry(
      'https://axiom-queue.appbuilder.workers.dev?dataset=app-builder-core-frontend-customer',
      // "&strategy=queue", // to send logs to a specific dataset [default: queue]
      {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        body: getSafeBody(p),
      },
    ).catch(err => {
      console.log('error ocuured while replacing circular reference', p, err);
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
    batchId = batchId + 1;
  };

  const log = (logContent: {[key: string]: any}) => {
    logContent.batchId = batchId;
    queue.push(logContent);
    if (queue.length >= 500) {
      flush();
    } else {
      if (timeout === null) {
        // @ts-ignore
        timeout = setTimeout(() => {
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
      logContent: getTopLevels(logContent),
      contextInfo,
      ...columns,
    });

    isWeb() &&
      window.addEventListener('beforeunload', () => {
        flush();
      });
  };
  return printLogs;
};

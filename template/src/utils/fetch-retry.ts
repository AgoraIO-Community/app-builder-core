import createRetryFetch from 'fetch-retry';

export const fetchRetry = createRetryFetch(fetch, {
  retries: 3,
  retryDelay: function (attempt) {
    return Math.pow(2, attempt) * 1000; // 1000, 2000, 4000
  },
  retryOn: function (attempt, error, response) {
    if (attempt > 3) {
      /**
       * Stop retrying after three attempts
       * The above retries param is ignored if retryOn function is provided,
       * hence, we return falsy from there
       */
      return false;
    }
    // retry on any network error, or 4xx or 5xx status codes
    if (error !== null || (response.status > 400 && attempt <= 3)) {
      console.log(`retrying, attempt number ${attempt + 1}`);
      return true;
    }
  },
});

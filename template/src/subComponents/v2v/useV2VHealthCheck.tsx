import {useState, useEffect, useRef} from 'react';
import {V2V_URL} from './utils';

const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds - responses slower than this are considered unhealthy alhtough returns 200

export const useV2VHealthCheck = () => {
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const checkHealth = async () => {
    // Prevent multiple simultaneous checks
    if (isChecking) return;

    setIsChecking(true);

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    // Set timeout - abort request if it takes longer than HEALTH_CHECK_TIMEOUT
    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, HEALTH_CHECK_TIMEOUT);

    try {
      const response = await fetch(`${V2V_URL}/health`, {
        method: 'GET',
        signal: abortControllerRef.current.signal,
        cache: 'no-cache',
      });

      // Clear timeout since request completed
      clearTimeout(timeoutId);
      setIsHealthy(response.ok && response.status === 200);
    } catch (error) {
      // Clear timeout on error
      clearTimeout(timeoutId);
      // Both network errors AND timeouts result in unhealthy status
      if (error.name !== 'AbortError') {
        setIsHealthy(false);
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Initial health check
    checkHealth();

    // Set up interval to check every 3 seconds
    intervalRef.current = setInterval(checkHealth, 3000);

    return () => {
      // Cleanup interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Cleanup pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isHealthy,
    isChecking,
  };
};

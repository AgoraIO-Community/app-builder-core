import {useEffect, useState, useRef} from 'react';

const useCountdown = (targetDate: number) => {
  const countDownDate = new Date(targetDate).getTime();
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // Add a ref to store the interval id

  const [countDown, setCountDown] = useState(
    countDownDate - new Date().getTime(),
  );

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountDown(_ => {
        const newCountDown = countDownDate - new Date().getTime();
        if (newCountDown <= 0) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return newCountDown;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [countDownDate]);

  return getReturnValues(countDown);
};

const getReturnValues = countDown => {
  // calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds];
};

export {useCountdown};

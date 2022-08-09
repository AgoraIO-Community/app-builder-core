import React from 'react';
import {useFpe} from 'fpe-api';

const CustomUserContextHolder: React.FC<{children: any}> = (props) => {
  const useUserContext = useFpe((config) => {
    if (config?.useUserContext) {
      return config?.useUserContext;
    } else {
      return () => {};
    }
  });
  useUserContext();
  return props.children;
};
export default CustomUserContextHolder;

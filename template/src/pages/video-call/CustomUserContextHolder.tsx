import React from 'react';
import {useFpe} from 'fpe-api';

const CustomUserContextHolder: React.FC<{children: any}> = (props) => {
  //commented for v1 release
  // const fpeCustomContext = useFpe((config) => config?.customUserContext);
  // if (fpeCustomContext) {
  //   fpeCustomContext();
  // }
  return props.children;
};
export default CustomUserContextHolder;

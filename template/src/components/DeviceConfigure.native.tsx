import React from 'react';
import KeepAwake from 'react-native-keep-awake';

const DeviceConfigure: React.FC = (props: any) => {
  return (
    <>
      {props.children}
      <KeepAwake />
    </>
  );
};

export default DeviceConfigure;

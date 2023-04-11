import React from 'react';
import Toast from '../../react-native-toast-message';
import ToastConfig from '../subComponents/ToastConfig';

const ToastComponent = () => {
  if ($config.TOAST_NOTIFICATIONS) {
    return <Toast ref={(ref) => Toast.setRef(ref)} config={ToastConfig} />;
  } else return <></>;
};
export default ToastComponent;

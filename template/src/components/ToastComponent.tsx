import React from 'react';
import Toast from '../../react-native-toast-message';
import ToastConfig from '../subComponents/ToastConfig';
import {useIsRecordingBot} from '../subComponents/recording/useIsRecordingBot';

const ToastComponent = () => {
  const {isRecordingBot} = useIsRecordingBot();

  // if ($config.TOAST_NOTIFICATIONS) {
  //   return <Toast ref={(ref) => Toast.setRef(ref)} config={ToastConfig} />;
  // } else return <></>;
  if (isRecordingBot) {
    return <></>;
  }
  return <Toast ref={ref => Toast.setRef(ref)} config={ToastConfig} />;
};
export default ToastComponent;

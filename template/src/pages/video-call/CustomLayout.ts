import {useFpe} from 'fpe-api';
import {DefaultLayouts} from './DefaultLayouts';

function useCustomLayout() {
  const fpeLayouts = useFpe((config) => {
    if (
      typeof config?.components?.videoCall === 'object' &&
      config?.components?.videoCall?.customLayout
    ) {
      return config.components.videoCall.customLayout(DefaultLayouts);
    } else {
      return DefaultLayouts;
    }
  });
  return fpeLayouts;
}
export default useCustomLayout;

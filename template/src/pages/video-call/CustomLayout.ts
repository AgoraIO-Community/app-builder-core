import {useCustomization} from 'customization-implementation';
import {DefaultLayouts} from './DefaultLayouts';

function useCustomLayout() {
  const fpeLayouts = useCustomization((config) => {
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

import {useFpe} from 'fpe-api';
import {DefaultSidePanels} from './DefaultSidePanels';

function useCustomSidepanel() {
  const fpeSidepanels = useFpe((config) => {
    if (
      typeof config?.components?.videoCall === 'object' &&
      config?.components?.videoCall?.customSidePanel
    ) {
      return config.components.videoCall.customSidePanel(DefaultSidePanels);
    } else {
      return DefaultSidePanels;
    }
  });
  return fpeSidepanels;
}
export default useCustomSidepanel;

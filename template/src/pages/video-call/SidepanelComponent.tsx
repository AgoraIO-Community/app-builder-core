import React, {useEffect, useState} from 'react';
import {isArray, isValidElementType} from '../../utils/common';
import useCustomSidepanel from './CustomSidePanels';
import {useSidePanel} from '../../utils/useSidePanel';

const SidePanelComponent = () => {
  const [sidePanelIndex, setsidePanelIndex] = useState(0);
  const fpeSidePanels = useCustomSidepanel();
  const {sidePanel: activeSidePanel} = useSidePanel();
  useEffect(() => {
    if (isArray(fpeSidePanels)) {
      let index = fpeSidePanels.findIndex(
        (item) => item.name === activeSidePanel,
      );
      if (index >= 0) {
        setsidePanelIndex(index);
      }
    }
  }, [activeSidePanel]);

  if (
    fpeSidePanels &&
    fpeSidePanels[sidePanelIndex] &&
    isValidElementType(fpeSidePanels[sidePanelIndex].component)
  ) {
    const CurrentSidePanelComponent = fpeSidePanels[sidePanelIndex].component;
    return <CurrentSidePanelComponent />;
  }
  return <></>;
};
export default SidePanelComponent;

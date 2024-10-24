import React from 'react';
import {ToolbarPreset, useSidePanel} from 'customization-api';
import {
  PollButtonSidePanelTrigger,
  POLL_SIDEBAR_NAME,
} from './polling/components/PollButtonSidePanelTrigger';

const NativeBottomToolbar = () => {
  const {setSidePanel} = useSidePanel();

  return (
    <ToolbarPreset
      align="bottom"
      items={{
        more: {
          fields: {
            poll: {
              component: PollButtonSidePanelTrigger,
              onPress: () => {
                setSidePanel(POLL_SIDEBAR_NAME);
              },
            },
          },
        },
      }}
    />
  );
};

export default NativeBottomToolbar;

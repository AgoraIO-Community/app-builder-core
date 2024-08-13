import React from 'react';
import {Button} from 'react-native';
import {
  customize,
  ToolbarPreset,
  useSidePanel,
  ToolbarItem,
} from 'customization-api';
import PollSidebar from './polling/components/PollSidebar';
import Poll from './polling/components/Poll';

const POLL_SIDEBAR_NAME = 'side-panel-poll';

const PollSidebarButton = () => {
  const {setSidePanel} = useSidePanel();
  return (
    <ToolbarItem>
      <Button
        title="Poll Sidebar"
        onPress={() => setSidePanel(POLL_SIDEBAR_NAME)}
      />
    </ToolbarItem>
  );
};

const customBottomToolbar = () => {
  return (
    <ToolbarPreset
      align="bottom"
      items={{
        test: {
          align: 'end',
          component: PollSidebarButton,
        },
      }}
    />
  );
};

const config = customize({
  components: {
    videoCall: {
      wrapper: Poll,
      customSidePanel: () => {
        return [
          {
            name: POLL_SIDEBAR_NAME,
            component: PollSidebar,
            title: 'Polls',
            onClose: () => {},
          },
        ];
      },
      bottomToolBar: customBottomToolbar,
    },
  },
});

export default config;

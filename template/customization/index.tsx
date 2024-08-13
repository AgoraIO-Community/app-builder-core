import React from 'react';
import {View, Text, Button} from 'react-native';
import {
  customize,
  ToolbarPreset,
  useSidePanel,
  ToolbarItem,
} from 'customization-api';
import PollDemo from './PollDemo';

const TestButton1 = () => {
  const {setSidePanel} = useSidePanel();
  return (
    <ToolbarItem>
      <Button title="Test1" onPress={() => setSidePanel('side-panel-1')} />
    </ToolbarItem>
  );
};
const TestButton2 = () => {
  const {setSidePanel} = useSidePanel();
  return (
    <ToolbarItem>
      <ToolbarItem>
        <Button title="Test2" onPress={() => setSidePanel('side-panel-2')} />
      </ToolbarItem>
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
          component: TestButton1,
        },
        test2: {
          align: 'end',
          component: TestButton2,
        },
      }}
    />
  );
};

const Sidepanel1 = () => {
  return (
    <View>
      <Text style={{color: 'white'}}> Sidepanel1 content</Text>
    </View>
  );
};
const Sidepanel2 = () => {
  return (
    <View>
      <Text style={{color: 'white'}}> Sidepanel2 content</Text>
    </View>
  );
};

const config = customize({
  components: {
    videoCall: {
      wrapper: PollDemo,
      customSidePanel: () => {
        return [
          {
            name: 'side-panel-1',
            component: Sidepanel1,
            title: 'SidePanel - One',
            onClose: () => {},
          },
          {
            name: 'side-panel-2',
            component: Sidepanel2,
            title: 'SidePanel - Two',
            onClose: () => {},
          },
        ];
      },
      bottomToolBar: customBottomToolbar,
    },
  },
});

export default config;

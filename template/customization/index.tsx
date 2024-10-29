import {$config, customize} from 'customization-api';
import NativeBottomToolbar from './bottombar-native';
import PollSidebar from './polling/components/PollSidebar';
import Poll from './polling/components/Poll';
import {POLL_SIDEBAR_NAME} from './polling/components/PollButtonSidePanelTrigger';

const config = customize({
  components: {
    videoCall: {
      wrapper: Poll,
      bottomToolBar: NativeBottomToolbar,
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
    },
  },
});

const isLiveMode = $config.AUDIO_ROOM || $config.EVENT_MODE;

export default isLiveMode ? {} : config;

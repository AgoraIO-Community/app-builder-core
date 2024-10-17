import {customize} from 'customization-api';
import PollSidebar from './polling/components/PollSidebar';
import Poll from './polling/components/Poll';
import {CustomBottomToolbar, POLL_SIDEBAR_NAME} from './custom-ui';

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
      bottomToolBar: CustomBottomToolbar,
    },
  },
});

export default config;

import React from 'react';
import {ToolbarPreset} from 'customization-api';
import {AgentControl} from '../AgentControls';
import {CustomSettingButton, CustomTranscriptButton} from '../Bottombar';

const Bottombar = () => {
  return (
    <ToolbarPreset
      align="bottom"
      snapPointsMinMax={
        $config.AI_LAYOUT === 'LAYOUT_TYPE_1' ? [100, 100] : [0, 0]
      }
      items={{
        layout: {hide: true},
        invite: {hide: true},
        more: {hide: true},
        'meeting-title': {
          hide: true,
        },
        'participant-count': {
          hide: true,
        },
        'local-audio': {order: 0},
        'local-video': {hide: true},
        screenshare: {hide: true},
        recording: {hide: true},
        'connect-agent': {
          align: 'center',
          label: 'Agent',
          component: AgentControl,
          order: 1,
        },
        'end-call': {align: 'center', hide: true},
        'custom-transcript': {
          align: 'end',
          order: 2,
          component: CustomTranscriptButton,
        },
        'custom-settings': {
          align: 'end',
          order: 3,
          component: CustomSettingButton,
        },
        participant: {
          hide: true,
        },
        transcript: {
          hide: true,
        },
        settings: {
          hide: true,
        },
        caption: {
          hide: true,
        },
        chat: {
          hide: true,
        },
      }}
    />
  );
};

export default Bottombar;

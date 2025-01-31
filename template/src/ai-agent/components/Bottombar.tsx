import {
  ToolbarPreset,
  ToolbarComponents,
  useSidePanel,
  useRoomInfo,
} from 'customization-api';
import ThemeConfig from '../../theme';
import {isMobileUA} from '../../utils/common';
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {AgentControl} from './AgentControls';
import {LogoIcon} from './icons';

export const LogoComponent = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginRight: 20,
      }}>
      <LogoIcon />
      <Text
        style={{
          color: '#C3C3C3',
          textAlign: 'center',
          fontSize: 18,
          fontStyle: 'normal',
          fontWeight: '600',
          lineHeight: 18,
          fontFamily: ThemeConfig.FontFamily.sansPro,
        }}>
        AI Builder Demo
      </Text>
    </View>
  );
};

const Bottombar = () => {
  const {MeetingTitleToolbarItem, ParticipantCountToolbarItem} =
    ToolbarComponents;
  const {setSidePanel} = useSidePanel();
  const {data} = useRoomInfo();
  const [clientId, setClientId] = useState<string | null>(null);
  useEffect(() => {
    !isMobileUA() && setSidePanel('agent-transcript-panel');
  }, []);
  return (
    <ToolbarPreset
      align="bottom"
      items={{
        layout: {hide: true},
        invite: {hide: true},
        more: {hide: true},
        logo: {
          align: 'start',
          order: 0,
          component: () => <LogoComponent />,
        },
        'meeting-title': {
          align: 'start',
          component: MeetingTitleToolbarItem,
          order: 1,
          hide: true,
        },
        'participant-count': {
          align: 'start',
          component: ParticipantCountToolbarItem,
          order: 2,
          hide: true,
        },

        'connect-agent': {
          align: 'end',
          label: 'Agent',
          component: () => <AgentControl channel_name={data.channel} />,
          order: 3,
        },
        'local-video': {hide: true},
        screenshare: {hide: true},
        recording: {hide: true},
        'local-audio': {align: 'end', order: 1},
        'end-call': {align: 'end', order: 2, hide: true},
      }}
    />
  );
};

export default Bottombar;

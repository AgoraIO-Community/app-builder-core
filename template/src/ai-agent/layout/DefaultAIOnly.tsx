import React, {useEffect, useState, useContext} from 'react';
import {ILocalAudioTrack, IRemoteAudioTrack} from 'agora-rtc-sdk-ng';
import {View} from 'react-native';
import {
  MaxVideoView,
  useContent,
  type LayoutComponent,
  useRtc,
  useLocalAudio,
} from 'customization-api';
import {isMobileUA} from '../../utils/common';
import AudioVisualizer, {DisconnectedView} from '../components/AudioVisualizer';
import {AgentState} from '../components/AgentControls/const';
import {AgentContext} from '../components/AgentControls/AgentContext';

export const DefaultAIOnly: LayoutComponent = () => {
  const {defaultContent, activeUids} = useContent();
  const {RtcEngineUnsafe} = useRtc();
  const [localTracks, setLocalTrack] = useState<ILocalAudioTrack | null>(null);
  const [remoteTrack, setRemoteTrack] = useState<IRemoteAudioTrack | null>(
    null,
  );

  const {agentConnectionState, agentUID} = useContext(AgentContext);

  const {getLocalAudioStream, getRemoteAudioStream} = useLocalAudio();

  const connected = activeUids.includes(agentUID);

  // this state occurs when agent_stop is successful, but
  // user is still not disconnected from the RTC channel - state-of-wait
  const isAwaitingLeave = agentConnectionState === AgentState.AWAITING_LEAVE;

  useEffect(() => {
    if (getLocalAudioStream()) {
      setLocalTrack(getLocalAudioStream());
    }
  }, [RtcEngineUnsafe]);

  useEffect(() => {
    if (getRemoteAudioStream(agentUID)) {
      setRemoteTrack(getRemoteAudioStream(agentUID));
    }
  }, [activeUids]);

  return (
    <View
      style={[
        {flex: 1, display: 'flex', flexDirection: 'row'},
        isMobileUA() ? {marginBottom: 100} : {},
      ]}>
      <View
        style={[
          {
            flex: 2,
            display: 'flex',
            flexDirection: 'row',
            borderRadius: 10,
          },
          isMobileUA() ? {flexDirection: 'column', padding: 12} : {},
        ]}>
        <View style={{flex: 1}}>
          <MaxVideoView
            user={{
              ...defaultContent[agentUID],
              name: 'AI Agent',
              video: false,
              type: 'ai-agent',
            }}
            CustomChild={() =>
              // show agent voice waves, when agent is connected to the channel, but also not on a state-of-wait,
              connected && !isAwaitingLeave ? (
                <AudioVisualizer audioTrack={remoteTrack} />
              ) : (
                <DisconnectedView isConnected={connected} />
              )
            }
            hideMenuOptions={true}
          />
        </View>
      </View>
    </View>
  );
};

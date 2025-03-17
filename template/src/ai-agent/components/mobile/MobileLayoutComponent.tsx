import React, {useContext, useEffect, useState} from 'react';
import {View} from 'react-native';
import {ILocalAudioTrack, IRemoteAudioTrack} from 'agora-rtc-sdk-ng';
import {
  MaxVideoView,
  useContent,
  useLocalUid,
  LayoutComponent,
  useRtc,
  useLocalAudio,
  useIsAudioEnabled,
} from 'customization-api';
import AudioVisualizer, {DisconnectedView} from '../AudioVisualizer';
import {ActiveSpeakerAnimation} from '../../components/LocalAudioWave';
import {AgentContext} from '../AgentControls/AgentContext';

const MobileLayoutComponent: LayoutComponent = () => {
  const localUid = useLocalUid();
  const {defaultContent, activeUids} = useContent();
  const {RtcEngineUnsafe} = useRtc();
  const [localTracks, setLocalTrack] = useState<ILocalAudioTrack | null>(null);
  const [remoteTrack, setRemoteTrack] = useState<IRemoteAudioTrack | null>(
    null,
  );
  const {agentUID} = useContext(AgentContext);

  const {getLocalAudioStream, getRemoteAudioStream} = useLocalAudio();
  const isAudioEnabled = useIsAudioEnabled();
  const connected = activeUids.includes(agentUID);

  useEffect(() => {
    if (getLocalAudioStream()) {
      setLocalTrack(getLocalAudioStream());
    }
  }, [RtcEngineUnsafe]);

  useEffect(() => {}, [isAudioEnabled]);

  useEffect(() => {
    if (getRemoteAudioStream(agentUID)) {
      setRemoteTrack(getRemoteAudioStream(agentUID));
    }
  }, [activeUids]);

  return (
    <View
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <MaxVideoView
        containerStyle={{borderRadius: 12, borderWidth: 0}}
        innerContainerStyle={{backgroundColor: '#222'}}
        user={{
          ...defaultContent[agentUID],
          name: 'AI Agent',
          video: false,
          type: 'ai-agent',
        }}
        CustomChild={() =>
          connected ? (
            <AudioVisualizer audioTrack={remoteTrack} />
          ) : (
            <DisconnectedView isConnected={connected} />
          )
        }
        hideMenuOptions={true}
      />
      <View
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          flexDirection: 'row',
          height: 100,
          width: 215,
        }}>
        <MaxVideoView
          containerStyle={{borderRadius: 8, borderWidth: 0}}
          user={defaultContent[localUid]}
          avatarRadius={48}
          hideMenuOptions={true}
        />
        <View
          style={{
            position: 'absolute',
            width: 100,
            height: 50,
            bottom: 16,
            right: -38,
          }}>
          {localTracks && isAudioEnabled(localUid) && (
            <ActiveSpeakerAnimation
              audioTrack={localTracks}
              isMuted={!isAudioEnabled(localUid)}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default MobileLayoutComponent;

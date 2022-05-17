import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useFpe} from 'fpe-api';
import Navbar from '../../components/Navbar';
import ParticipantsView from '../../components/ParticipantsView';
import SettingsView from '../../components/SettingsView';
import Controls from '../../components/Controls';
import Chat from '../../components/Chat';
import {SidePanelType} from '../../subComponents/SidePanelEnum';
import {cmpTypeGuard, isValidElementType, isWeb} from '../../utils/common';
import {useSidePanel} from '../../utils/useSidePanel';
import VideoComponent from './VideoComponent';
import {videoView} from '../../../theme.json';

const VideoCallScreen = () => {
  const {sidePanel} = useSidePanel();
  const {
    chat: ChatFPE,
    bottomBar: FpeBottombarComponent,
    participantsPanel: FpeParticipantsComponent,
    settingsPanel: FpeSettingsComponent,
    topBar: FpeTopbarComponent,
  } = useFpe((data) =>
    data?.components?.videoCall &&
    typeof data?.components?.videoCall === 'object'
      ? data.components?.videoCall
      : {},
  );
  const FpeChatComponent =
    typeof ChatFPE !== 'object' ? isValidElementType(ChatFPE) : undefined;
  return (
    <View style={style.full}>
      {cmpTypeGuard(Navbar, FpeTopbarComponent)}
      <View style={[style.videoView, {backgroundColor: '#ffffff00'}]}>
        <VideoComponent />
        {sidePanel === SidePanelType.Participants ? (
          cmpTypeGuard(ParticipantsView, FpeParticipantsComponent)
        ) : (
          <></>
        )}
        {sidePanel === SidePanelType.Chat ? (
          $config.CHAT ? (
            cmpTypeGuard(Chat, FpeChatComponent)
          ) : (
            <></>
          )
        ) : (
          <></>
        )}
        {sidePanel === SidePanelType.Settings ? (
          cmpTypeGuard(SettingsView, FpeSettingsComponent)
        ) : (
          <></>
        )}
      </View>
      {!isWeb && sidePanel === SidePanelType.Chat ? (
        <></>
      ) : (
        cmpTypeGuard(Controls, FpeBottombarComponent)
      )}
    </View>
  );
};
export default VideoCallScreen;
//change these to inline styles or sth
const style = StyleSheet.create({
  full: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  videoView: videoView,
});

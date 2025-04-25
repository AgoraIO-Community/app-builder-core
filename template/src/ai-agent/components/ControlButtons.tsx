import React, {useContext} from 'react';
import {StyleSheet, TouchableOpacity, Image} from 'react-native';
import {
  MUTE_LOCAL_TYPE,
  useSidePanel,
  useLocalUserInfo,
  useMuteToggleLocal,
  SidePanelType,
} from 'customization-api';
import {AgentContext} from '../components/AgentControls/AgentContext';
//@ts-ignore
import MicOnIcon from '../assets/mic-on.png';
//@ts-ignore
import MicOffIcon from '../assets/mic-off.png';
//@ts-ignore
import TranscriptIcon from '../assets/transcript.png';
//@ts-ignore
import SettingsIcon from '../assets/settings.png';
//@ts-ignore
import LeaveCallIcon from '../assets/leave-call.png';

export const MicButton = () => {
  const {audio} = useLocalUserInfo();
  const muteToggle = useMuteToggleLocal();
  return (
    <TouchableOpacity
      style={{
        backgroundColor: audio
          ? $config.PRIMARY_ACTION_BRAND_COLOR
          : $config.ICON_BG_COLOR,
        borderRadius: 50,
        marginHorizontal: 8,
      }}
      onPress={() => muteToggle(MUTE_LOCAL_TYPE.audio)}>
      <Image
        style={[styles.iconStyle, {tintColor: $config.FONT_COLOR}]}
        source={audio ? MicOnIcon : MicOffIcon}
      />
    </TouchableOpacity>
  );
};
export const TranscriptButton = () => {
  const {setSidePanel, sidePanel} = useSidePanel();
  return (
    <TouchableOpacity
      style={{
        backgroundColor:
          sidePanel === 'agent-transcript-panel'
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : $config.ICON_BG_COLOR,
        borderRadius: 50,
        marginHorizontal: 8,
      }}
      onPress={() => {
        if (sidePanel === 'agent-transcript-panel') {
          setSidePanel(SidePanelType.None);
        } else if (sidePanel !== 'agent-transcript-panel') {
          setSidePanel('agent-transcript-panel');
        }
      }}>
      <Image
        style={[
          styles.iconStyle,
          {
            tintColor: $config.FONT_COLOR,
          },
        ]}
        source={TranscriptIcon}
      />
    </TouchableOpacity>
  );
};

export const SettingButton = () => {
  const {setSidePanel, sidePanel} = useSidePanel();
  return (
    <TouchableOpacity
      style={{
        backgroundColor:
          sidePanel === 'custom-settings-panel'
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : $config.ICON_BG_COLOR,
        borderRadius: 50,
        marginHorizontal: 8,
      }}
      onPress={() => {
        if (sidePanel === 'custom-settings-panel') {
          setSidePanel(SidePanelType.None);
        } else if (sidePanel !== 'custom-settings-panel') {
          setSidePanel('custom-settings-panel');
        }
      }}>
      <Image
        style={[
          styles.iconStyle,
          {
            tintColor: $config.FONT_COLOR,
          },
        ]}
        source={SettingsIcon}
      />
    </TouchableOpacity>
  );
};

export const DisconnectButton = () => {
  const {toggleAgentConnection} = useContext(AgentContext);
  return (
    <TouchableOpacity
      style={{
        backgroundColor: $config.SEMANTIC_ERROR,
        borderRadius: 50,
        marginHorizontal: 8,
      }}
      onPress={() => {
        toggleAgentConnection(true);
      }}>
      <Image
        style={[styles.iconStyle, {tintColor: $config.FONT_COLOR}]}
        source={LeaveCallIcon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconStyle: {
    width: 24,
    height: 24,
    margin: 12,
  },
});

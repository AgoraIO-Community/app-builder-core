import React, {useContext, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Dropdown, Spacer, useRoomInfo} from 'customization-api';
import ThemeConfig from '../../theme';
import {AgentContext} from './AgentControls/AgentContext';
import {AI_AGENT_VOICE} from './AgentControls/const';

const SelectAiAgentVoice = () => {
  const {
    data: {agents},
  } = useRoomInfo();

  const {agentId, setAgentVoice, agentVoice} = useContext(AgentContext);

  const data = Object.keys(AI_AGENT_VOICE).map((key: string) => {
    return {
      label: key,
      value: key,
    };
  });

  useEffect(() => {
    if (agentId && !agentVoice && agents?.length) {
      //@ts-ignore
      setAgentVoice(agents?.find((agent: any) => agent.id === agentId)?.voice);
    }
  }, [agentId, agents]);

  return (
    <View>
      <Text style={style.label}>{'Voice'}</Text>
      <Spacer size={12} />
      <Dropdown
        icon={undefined}
        enabled={$config.ENABLE_CONVERSATIONAL_AI}
        //@ts-ignore
        selectedValue={agentVoice}
        label={
          !data || !data.length
            ? 'No AI Agent Voice Available'
            : !agentVoice
            ? 'Select AI Agent Voice'
            : AI_AGENT_VOICE[agentVoice]
        }
        data={data}
        onSelect={({label, value}) => {
          console.log('Selected AI Agent Voice:', label, value);
          //@ts-ignore
          if (agentVoice !== value) {
            //@ts-ignore
            setAgentVoice(value);
          }
        }}
      />
    </View>
  );
};

const style = StyleSheet.create({
  label: {
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});
export default SelectAiAgentVoice;

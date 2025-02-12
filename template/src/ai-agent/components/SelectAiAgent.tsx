import React, {useContext, useEffect, useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Dropdown, useRoomInfo, Spacer} from 'customization-api';
import ThemeConfig from '../../theme';
import {AgentContext} from './AgentControls/AgentContext';

const SelectAiAgent = () => {
  const {
    data: {agents},
  } = useRoomInfo();

  const {agentId, setAgentId} = useContext(AgentContext);

  const data = useMemo(() => {
    return agents?.map((agent: any) => {
      return {
        label: agent.agent_name,
        value: agent.id,
      };
    });
  }, [agents]);

  useEffect(() => {
    if (!agentId && data && data.length) {
      //set default agent
      setAgentId(data[0].value);
    }
  }, [agentId, data]);

  return (
    <View>
      <Text style={style.label}>{'Choose your AI Agent'}</Text>
      <Spacer size={12} />
      <Dropdown
        icon={undefined}
        enabled={
          $config.ENABLE_CONVERSATIONAL_AI && data && data.length ? true : false
        }
        //@ts-ignore
        selectedValue={agentId}
        label={
          !data || !data.length
            ? 'No AI Agent available'
            : !agentId
            ? 'Select AI Agent'
            : data.find(d => d.value === agentId)?.label
        }
        data={data}
        onSelect={({label, value}) => {
          console.log('Selected AI Agent:', label, value);
          //@ts-ignore
          if (agentId !== value) {
            //@ts-ignore
            setAgentId(value);
          }
        }}
      />
    </View>
  );
};

const style = StyleSheet.create({
  label: {
    fontWeight: '600',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});
export default SelectAiAgent;

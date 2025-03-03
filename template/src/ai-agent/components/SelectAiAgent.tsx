import React, {useContext, useEffect, useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Dropdown, useRoomInfo, Spacer} from 'customization-api';
import ThemeConfig from '../../theme';
import {AgentContext} from './AgentControls/AgentContext';

const SelectAiAgent = () => {
  const {
    data: {agents},
  } = useRoomInfo();

  const {agentId, setAgentId, agentConnectionState} = useContext(AgentContext);

  const data = useMemo(() => {
    return agents
      ?.filter(a => a.is_active === true)
      ?.map((agent: any) => {
        return {
          label: agent?.config?.llm?.agent_name,
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
      <Spacer size={8} />
      <Dropdown
        icon={undefined}
        enabled={
          $config.ENABLE_CONVERSATIONAL_AI && data && data.length
            ? agentConnectionState === 'AGENT_CONNECTED'
              ? false
              : true
            : false
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
        onSelect={async ({label, value}) => {
          if (agentId !== value) {
            setAgentId(value);
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
export default SelectAiAgent;

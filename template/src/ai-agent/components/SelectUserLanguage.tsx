import React, {useContext, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Dropdown, Spacer, useRoomInfo} from 'customization-api';
import ThemeConfig from '../../theme';
import {AgentContext} from './AgentControls/AgentContext';
import {ASR_LANGUAGES} from './AgentControls/const';

const SelectUserLanguage = () => {
  const {
    data: {agents},
  } = useRoomInfo();

  const {agentId, setLanguage, language, agentConnectionState} =
    useContext(AgentContext);

  const data = Object.keys(ASR_LANGUAGES).map((key: string) => {
    return {
      label: key,
      value: key,
    };
  });

  useEffect(() => {
    if (!language && agentId && agents?.length) {
      //@ts-ignore
      setLanguage(
        agents?.find((agent: any) => agent.id === agentId)?.asr_language,
      );
    } else if (language) {
      setLanguage(language);
    }
  }, [agentId, agents, language]);

  return (
    <View>
      <Text style={style.label}>{'Language'}</Text>
      <Spacer size={12} />
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
        selectedValue={language}
        label={
          !data || !data.length
            ? 'No Language Available'
            : !language
            ? 'Select Language'
            : ASR_LANGUAGES[language]
        }
        data={data}
        onSelect={({label, value}) => {
          console.log('Selected Language:', label, value);
          //@ts-ignore
          if (language !== value) {
            //@ts-ignore
            setLanguage(value);
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
export default SelectUserLanguage;

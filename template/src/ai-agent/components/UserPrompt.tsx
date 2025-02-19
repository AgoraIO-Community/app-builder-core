import React, {useContext, useEffect} from 'react';
import {View, TextInput, StyleSheet, Text, Platform} from 'react-native';
import ThemeConfig from '../../theme';
import {AgentContext} from './AgentControls/AgentContext';
import {useRoomInfo} from 'customization-api';

const UserPrompt = () => {
  const {prompt, setPrompt, agentConnectionState, agentId} =
    useContext(AgentContext);
  const {
    data: {agents},
  } = useRoomInfo();

  useEffect(() => {
    if (agentId) {
      setPrompt(agents?.find(a => a?.id === agentId)?.config?.llm?.prompt);
    }
  }, [agentId, agents, setPrompt]);
  return (
    <>
      <Text style={styles.label}>Prompt</Text>
      <View style={styles.container}>
        <TextInput
          aria-disabled={
            agentConnectionState === 'AGENT_CONNECTED' ? true : false
          }
          style={[
            styles.input,
            agentConnectionState === 'AGENT_CONNECTED' ? {opacity: 0.4} : {},
          ]}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Customize Prompt"
          numberOfLines={10}
          multiline={true}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 8,
    overflow: 'hidden',
  },
  label: {
    fontWeight: '600',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    marginBottom: 12,
  },
  input: {
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.small,
    width: '100%',
    padding: 8,
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
});

export default UserPrompt;

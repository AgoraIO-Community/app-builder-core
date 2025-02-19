import React, {useContext} from 'react';
import {View, TextInput, StyleSheet, Text, Platform} from 'react-native';
import ThemeConfig from '../../theme';
import {AgentContext} from './AgentControls/AgentContext';

const UserPrompt = () => {
  const {prompt, setPrompt} = useContext(AgentContext);
  return (
    <>
      <Text style={styles.label}>Prompt</Text>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Customize Prompt"
          numberOfLines={5}
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

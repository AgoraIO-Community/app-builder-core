import {StyleSheet, View, ScrollView, Text} from 'react-native';
import React, {useContext, useEffect} from 'react';
import {
  SelectDevice,
  Spacer,
  $config,
  EditName,
  useRoomInfo,
  isAndroid,
  isIOS,
} from 'customization-api';
import SelectAiAgent from './SelectAiAgent';
import ThemeConfig from '../../theme';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {AgentContext} from './AgentControls/AgentContext';
import UserPrompt from './UserPrompt';
import {useIsAgentAvailable} from './utils';
import Toggle from '../../atoms/Toggle';
import SelectUserLanguage from './SelectUserLanguage';

const InfoSection = () => {
  const {agentConnectionState, agentId} = useContext(AgentContext);
  const {
    data: {roomId, uid, agents},
  } = useRoomInfo();

  const formatVoiceName = key => {
    try {
      return key
        .replace(/en-US-/, '') // Remove "en-US-"
        .replace(/Neural/g, '') // Remove "Neural"
        .replace(/Multilingual/g, '(Multilingual)') // Format "Multilingual"
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .trim();
    } catch (error) {
      return key;
    }
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>INFO</Text>
      <Spacer size={16} />
      <View style={styles.infoRowContainer}>
        <View style={styles.flex1}>
          <Text style={styles.infoRowLabel}>Agent Status</Text>
        </View>
        <View style={[styles.flex1, styles.alignEnd]}>
          <Text
            style={[
              styles.infoRowValue,
              {
                color:
                  agentConnectionState === 'AGENT_CONNECTED'
                    ? $config.SEMANTIC_SUCCESS
                    : $config.SEMANTIC_WARNING,
              },
            ]}>
            {agentConnectionState === 'AGENT_CONNECTED'
              ? 'Connected'
              : 'Not Connected'}
          </Text>
        </View>
      </View>
      {agentId ? (
        <View style={styles.infoRowContainer}>
          <View style={styles.flex1}>
            <Text style={styles.infoRowLabel}>Agent Voice</Text>
          </View>
          <View style={[styles.flex1, styles.alignEnd]}>
            <Text style={[styles.infoRowValue]}>
              {formatVoiceName(
                agents?.find(a => a.id === agentId)?.tts?.params?.voice_name,
              )}
            </Text>
          </View>
        </View>
      ) : (
        <></>
      )}
      <View style={styles.infoRowContainer}>
        <View style={styles.flex1}>
          <Text style={styles.infoRowLabel}>Room Status</Text>
        </View>
        <View style={[styles.flex1, styles.alignEnd]}>
          <Text
            style={[styles.infoRowLabel, {color: $config.SEMANTIC_SUCCESS}]}>
            {'Connected'}
          </Text>
        </View>
      </View>
      <View style={styles.infoRowContainer}>
        <View style={styles.flex1}>
          <Text style={styles.infoRowLabel}>Room-ID</Text>
        </View>
        <View style={[styles.flex1, styles.alignEnd]}>
          <Text style={styles.infoRowLabel}>{roomId?.host}</Text>
        </View>
      </View>
      <View style={styles.infoRowContainer}>
        <View style={styles.flex1}>
          <Text style={styles.infoRowLabel}>Your-ID</Text>
        </View>
        <View style={[styles.flex1, styles.alignEnd]}>
          <Text style={styles.infoRowLabel}>{uid}</Text>
        </View>
      </View>
    </View>
  );
};

const AdvancedSettings = () => {
  const {
    isInterruptionHandlingEnabled,
    setIsInterruptionHandlingEnabled,
    agentId,
    agentConnectionState,
  } = useContext(AgentContext);
  const {
    data: {agents},
  } = useRoomInfo();

  //when user switchs agent then update the toggle value for that agent
  useEffect(() => {
    if (
      isInterruptionHandlingEnabled === undefined &&
      agentId &&
      agents?.length
    ) {
      setIsInterruptionHandlingEnabled(
        agents?.find(a => a?.id === agentId)?.enable_aivad,
      );
    }
  }, [agentId, agents, isInterruptionHandlingEnabled]);

  const disabled = $config.ENABLE_CONVERSATIONAL_AI
    ? agentConnectionState === 'AGENT_CONNECTED'
      ? true
      : false
    : true;

  return (
    <View style={[{flexDirection: 'row', justifyContent: 'space-between'}]}>
      <Text
        style={{
          fontFamily: ThemeConfig.FontFamily.sansPro,
          fontSize: 14,
          lineHeight: 14,
          color: $config.FONT_COLOR,
        }}>
        Intelligent Interruption Handling
      </Text>
      <Toggle
        customContainerStyle={disabled ? {opacity: 0.4} : {}}
        disabled={disabled}
        isEnabled={isInterruptionHandlingEnabled}
        toggleSwitch={setIsInterruptionHandlingEnabled}
      />
    </View>
  );
};

const CustomSettingsPanel = () => {
  const isAgentAvailable = useIsAgentAvailable();
  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>AI AGENT</Text>
          <Spacer size={16} />
          <SelectAiAgent />
          {isAgentAvailable ? (
            <>
              <Spacer size={16} />
              <UserPrompt />
              <Spacer size={16} />
              <SelectUserLanguage />
              <Spacer size={16} />
              <AdvancedSettings />
            </>
          ) : (
            <></>
          )}
        </View>
        <Spacer size={16} />
        <InfoSection />
        <Spacer size={16} />
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>CALL SETTINGS</Text>
          <Spacer size={16} />
          <EditName label="Joining as" />
          {!(isAndroid() || isIOS()) ? <SelectDevice /> : <Spacer size={16} />}
        </View>
      </ScrollView>
    </View>
  );
};

export default CustomSettingsPanel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
  },
  contentContainer: {
    padding: 16,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  sectionContainer: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontStyle: 'normal',
    lineHeight: 12,
    color: $config.FONT_COLOR + hexadecimalTransparency['40%'],
  },
  infoRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    flex: 2,
  },
  flex1: {
    flex: 1,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  infoRowLabel: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '600',
    color: $config.FONT_COLOR,
  },
  infoRowValue: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '400',
    color: $config.FONT_COLOR,
  },
});

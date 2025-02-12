import {StyleSheet, View, ScrollView, Text} from 'react-native';
import React, {useContext} from 'react';
import {
  SelectDevice,
  Spacer,
  $config,
  EditName,
  useRoomInfo,
} from 'customization-api';
import SelectAiAgent from './SelectAiAgent';
import SelectAiAgentVoice from './SelectAiAgentVoice';
import ThemeConfig from '../../theme';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {AgentContext} from './AgentControls/AgentContext';

const InfoSection = () => {
  const {agentConnectionState} = useContext(AgentContext);
  const {
    data: {roomId, uid},
  } = useRoomInfo();

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>INFO</Text>
      <Spacer size={12} />
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

const CustomSettingsPanel = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.contentContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>AI AGENT</Text>
          <Spacer size={12} />
          <SelectAiAgent />
          <Spacer size={12} />
          <SelectAiAgentVoice />
        </View>
        <Spacer size={24} />
        <InfoSection />
        <Spacer size={24} />
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>CALL SETTINGS</Text>
          <Spacer size={12} />
          <EditName label="Joining as" />
          <SelectDevice />
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

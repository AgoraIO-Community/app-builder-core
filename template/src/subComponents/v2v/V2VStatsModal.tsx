import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import Popup from '../../atoms/Popup';
import {useV2V} from './useVoice2Voice';
import ThemeConfig from '../../theme';
import SecondaryButton from '../../atoms/SecondaryButton';

const V2VStatsModal = ({visible, onClose}) => {
  const {statsList} = useV2V();

  const exportToCSV = () => {
    const headers = [
      'Text',
      'STT (ms)',
      'TTS (ms)',
      'Total (ms)',
      'Max Non-Final Tokens Duration (ms)',
      'TTS Provider',
      'TTS Model',
      'STT Model',
      'Connection Type',
    ];

    const csvData = statsList.map(stat => {
      const sttTime =
        stat.END_STT && stat.FIRST_NON_FINAL_STT
          ? Math.round((stat.END_STT - stat.FIRST_NON_FINAL_STT) * 1000)
          : '';
      const ttsTime =
        stat.FIRST_TTS && stat.BEGIN_TTS
          ? Math.round((stat.FIRST_TTS - stat.BEGIN_TTS) * 1000)
          : '';
      const total =
        typeof sttTime === 'number' && typeof ttsTime === 'number'
          ? sttTime + ttsTime
          : '';

      const text =
        stat.srcText && stat.tgtText && stat.srcLang && stat.tgtLang
          ? `${stat.srcText} (${stat.srcLang}) ${stat.tgtText} (${stat.tgtLang})`
          : stat.TEXT || '';

      return [
        `"${text.replace(/"/g, '""')}"`,
        sttTime,
        ttsTime,
        total,
        stat.maxNonFinalTokensDurationMs || '',
        stat.selectedTTS || '',
        stat.ttsModel || '',
        stat.sttModel || '',
        stat.useRestTTS || stat.ttsModel === 'arcana' ? 'Rest' : 'Websocket',
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `v2v-stats-${new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 16)}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <Popup
      modalVisible={visible}
      setModalVisible={onClose}
      showCloseIcon={true}
      title={'V2V Stats'}
      contentContainerStyle={styles.modalContent}
      onCancel={onClose}>
      <View style={styles.tableHeader}>
        <Text style={[styles.cell, styles.headerCell, styles.textColumn]}>
          Text
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.sttColumn]}>
          STT
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.ttsColumn]}>
          TTS
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.totalColumn]}>
          Total
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.tokensColumn]}>
          Max Non-Final Tokens Duration
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.providerColumn]}>
          TTS Provider
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.modelColumn]}>
          TTS Model
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.sttModelColumn]}>
          STT Model
        </Text>
        <Text style={[styles.cell, styles.headerCell, styles.connectionColumn]}>
          Connection Type
        </Text>
      </View>
      <ScrollView style={styles.scrollView}>
        {statsList.map((stat, idx) => {
          const sttTime =
            stat.END_STT && stat.FIRST_NON_FINAL_STT
              ? Math.round((stat.END_STT - stat.FIRST_NON_FINAL_STT) * 1000)
              : '-';
          const ttsTime =
            stat.FIRST_TTS && stat.BEGIN_TTS
              ? Math.round((stat.FIRST_TTS - stat.BEGIN_TTS) * 1000)
              : '-';
          const total =
            typeof sttTime === 'number' && typeof ttsTime === 'number'
              ? sttTime + ttsTime
              : '-';
          return (
            <View key={idx} style={styles.tableRow}>
              <Text
                style={[styles.cell, styles.textColumn]}
                numberOfLines={2}
                ellipsizeMode="tail">
                {stat.srcText && stat.tgtText && stat.srcLang && stat.tgtLang
                  ? `${stat.srcText} (${stat.srcLang})  ${stat.tgtText} (${stat.tgtLang})`
                  : stat.TEXT || '-'}
              </Text>
              <Text
                style={[styles.cell, styles.sttColumn]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {sttTime !== '-' ? `${sttTime} ms` : '-'}
              </Text>
              <Text
                style={[styles.cell, styles.ttsColumn]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {ttsTime !== '-' ? `${ttsTime} ms` : '-'}
              </Text>
              <Text
                style={[styles.cell, styles.totalColumn]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {total !== '-' ? `${total} ms` : '-'}
              </Text>
              <Text
                style={[styles.cell, styles.tokensColumn]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {stat.maxNonFinalTokensDurationMs
                  ? `${stat.maxNonFinalTokensDurationMs} ms`
                  : '-'}
              </Text>
              <Text
                style={[styles.cell, styles.providerColumn]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {stat.selectedTTS || '-'}
              </Text>
              <Text
                style={[styles.cell, styles.modelColumn]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {stat.ttsModel || '-'}
              </Text>
              <Text
                style={[styles.cell, styles.sttModelColumn]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {stat.sttModel || '-'}
              </Text>
              <Text
                style={[styles.cell, styles.connectionColumn]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {stat.useRestTTS || stat.ttsModel === 'arcana' ? 'Rest' : 'Websocket'}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={{marginTop: 16}}>
        <Text style={{color: '#888', fontWeight: 'bold'}}>Info:</Text>
        <Text style={styles.text}>STT Time: END_STT - FIRST_NON_FINAL_STT</Text>
        <Text style={styles.text}>TTS Time: FIRST_TTS - BEGIN_TTS</Text>
        <Text style={styles.text}>
          Max Non-Final Tokens Duration: The maximum allowed delay between a
          spoken word and its finalization in STT (configurable in the language
          popup).
        </Text>
        <Text style={styles.text}>
          TTS Provider: The Text-to-Speech provider used for this translation
          (e.g., rime, eleven_labs).
        </Text>
      </View>
      <View style={styles.exportButtonContainer}>
        <SecondaryButton
          text="Export CSV"
          onPress={exportToCSV}
          style={styles.exportButton}
          // containerStyle={styles.exportButton}
        />
      </View>
    </Popup>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 16,
    minWidth: 1070,
    maxWidth: 1070,
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingVertical: 6,
    alignItems: 'center',
  },
  cell: {
    color: '#fff',
    fontSize: 13,
    paddingHorizontal: 4,
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 14,
  },
  scrollView: {
    maxHeight: 340,
  },
  text: {
    color: '#888',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  exportButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  exportButton: {
    minWidth: 80,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  // Column-specific styles with fixed widths
  textColumn: {
    width: 250,
    maxWidth: 250,
    minWidth: 200,
  },
  sttColumn: {
    width: 80,
    maxWidth: 80,
    minWidth: 60,
  },
  ttsColumn: {
    width: 80,
    maxWidth: 80,
    minWidth: 60,
  },
  totalColumn: {
    width: 80,
    maxWidth: 80,
    minWidth: 60,
  },
  tokensColumn: {
    width: 120,
    maxWidth: 120,
    minWidth: 100,
  },
  providerColumn: {
    width: 100,
    maxWidth: 100,
    minWidth: 80,
  },
  modelColumn: {
    width: 120,
    maxWidth: 120,
    minWidth: 100,
  },
  sttModelColumn: {
    width: 120,
    maxWidth: 120,
    minWidth: 100,
  },
  connectionColumn: {
    width: 100,
    maxWidth: 100,
    minWidth: 80,
  },
});

export default V2VStatsModal;

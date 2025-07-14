import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import Popup from '../../atoms/Popup';
import {useV2V} from './useVoice2Voice';

const V2VStatsModal = ({visible, onClose}) => {
  const {statsList} = useV2V();
  return (
    <Popup
      modalVisible={visible}
      setModalVisible={onClose}
      showCloseIcon={true}
      title={'V2V Stats'}
      contentContainerStyle={styles.modalContent}
      onCancel={onClose}>
      <View style={styles.tableHeader}>
        <Text style={[styles.cell, styles.headerCell, {flex: 2}]}>Text</Text>
        <Text style={[styles.cell, styles.headerCell]}>STT</Text>
        <Text style={[styles.cell, styles.headerCell]}>TTS</Text>
        <Text style={[styles.cell, styles.headerCell]}>Total</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        {statsList.map((stat, idx) => {
          const sttTime =
            stat.BEGIN_TTS && stat.FIRST_NON_FINAL_STT
              ? Math.round((stat.BEGIN_TTS - stat.FIRST_NON_FINAL_STT) * 1000)
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
                style={[styles.cell, {flex: 2}]}
                numberOfLines={2}
                ellipsizeMode="tail">
                {stat.TEXT || '-'}
              </Text>
              <Text style={styles.cell}>
                {sttTime !== '-' ? `${sttTime} ms` : '-'}
              </Text>
              <Text style={styles.cell}>
                {ttsTime !== '-' ? `${ttsTime} ms` : '-'}
              </Text>
              <Text style={styles.cell}>
                {total !== '-' ? `${total} ms` : '-'}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </Popup>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    padding: 16,
    minWidth: 420,
    maxWidth: 600,
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
    flex: 1,
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
});

export default V2VStatsModal;

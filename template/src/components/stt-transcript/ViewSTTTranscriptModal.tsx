import React, {SetStateAction, Dispatch} from 'react';
import {View, StyleSheet} from 'react-native';
import {useString} from '../../utils/useString';
import {sttModalTitleIntn} from '../../language/default-labels/videoCallScreenLabels';
import GenericModal from '../common/GenericModal';
import STTTranscriptTable from './STTTranscriptTable';

interface ViewSTTModalProps {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ViewSTTTranscriptModal(props: ViewSTTModalProps) {
  const {setModalOpen} = props;

  const sttModalTitle = useString(sttModalTitleIntn)();

  return (
    <GenericModal
      visible={true}
      onRequestClose={() => setModalOpen(false)}
      showCloseIcon={true}
      title={sttModalTitle}
      cancelable={false}
      contentContainerStyle={style.contentContainer}>
      <View style={style.fullBody}>
        <STTTranscriptTable />
      </View>
    </GenericModal>
  );
}

const style = StyleSheet.create({
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 0,
    width: '100%',
  },
  fullBody: {
    width: '100%',
    flex: 1,
  },
});

import React, {SetStateAction, Dispatch} from 'react';
import {View} from 'react-native';
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
      contentContainerStyle={{}}>
      <View style={{width: '100%', flex: 1}}>
        <STTTranscriptTable />
      </View>
    </GenericModal>
  );
}

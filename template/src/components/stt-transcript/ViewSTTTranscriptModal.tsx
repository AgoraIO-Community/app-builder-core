import React, {SetStateAction, Dispatch} from 'react';
import {View} from 'react-native';
import {useString} from '../../utils/useString';
import {sttModalTitleIntn} from '../../language/default-labels/videoCallScreenLabels';
import GenericModal from '../common/GenericModal';
import STTTranscriptTable from './STTTranscriptTable';
import {style} from '../recordings/style';

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
      contentContainerStyle={style.mContainer}>
      <View style={style.mbody}>
        <STTTranscriptTable />
      </View>
    </GenericModal>
  );
}

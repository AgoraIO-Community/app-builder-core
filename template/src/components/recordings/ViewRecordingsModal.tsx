import React, {SetStateAction, Dispatch} from 'react';
import {View} from 'react-native';
import RecordingsModal from './RecordingsModal';
import {style} from './style';
import RecordingsDateTable from './RecordingsDateTable';
import {useString} from '../../utils/useString';
import {recordingModalTitleIntn} from '../../language/default-labels/videoCallScreenLabels';

interface ViewRecordingsModalProps {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
}

// interface FetchRecordingResponse {
//   pagination: {
//     limit: number;
//     total: number;
//     page: number;
//   };
//   recordings: [
//     {
//       id: string;
//       download_url: string;
//       title: string;
//       created_at: string;
//     },
//   ];
// }
// interface ViewRecordingsState {
//   status: 'idle' | 'pending' | 'resolved' | 'rejected';
//   data: FetchRecordingResponse;
//   error: null;
// }
export default function ViewRecordingsModal(props: ViewRecordingsModalProps) {
  const {setModalOpen} = props;

  const recordingModalTitle = useString(recordingModalTitleIntn)();

  return (
    <RecordingsModal
      modalVisible={true}
      setModalVisible={setModalOpen}
      showCloseIcon={true}
      title={recordingModalTitle}
      cancelable={false}
      contentContainerStyle={style.mContainer}>
      <View style={style.mbody}>
        <RecordingsDateTable />
      </View>
    </RecordingsModal>
  );
}

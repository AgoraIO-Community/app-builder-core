import React, {SetStateAction, Dispatch} from 'react';
import {View} from 'react-native';
import RecordingsModal from './RecordingsModal';
import {style} from './style';
import RecordingsDateTable from './RecordingsDateTable';

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

  return (
    <RecordingsModal
      modalVisible={true}
      setModalVisible={setModalOpen}
      showCloseIcon={true}
      title="Recordings"
      cancelable={false}
      contentContainerStyle={style.mContainer}>
      <View style={style.mbody}>
        <RecordingsDateTable />
      </View>
    </RecordingsModal>
  );
}

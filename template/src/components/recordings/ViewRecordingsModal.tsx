import React, {SetStateAction, Dispatch, useEffect} from 'react';
import {Text, View, ScrollView} from 'react-native';
import RecordingsModal from './RecordingsModal';
import RecordingsDateView from './RecordingsDataView';
import {style} from './style';
import {useRecording} from '../../subComponents/recording/useRecording';

interface ViewRecordingsModalProps {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ViewRecordingsModal(props: ViewRecordingsModalProps) {
  const {setModalOpen} = props;
  const [state, setState] = React.useState({
    status: 'idle',
    data: {
      pagination: null,
      recordings: [],
    },
    error: null,
  });

  const {fetchRecordings} = useRecording();

  useEffect(() => {
    setState(prev => ({...prev, status: 'pending'}));
    fetchRecordings().then(
      response =>
        setState(prev => ({
          ...prev,
          status: 'resolved',
          data: {
            recordings: response?.recordings || [],
            pagination: response?.pagination || {},
          },
        })),
      error => setState(prev => ({...prev, status: 'rejected', error})),
    );
  }, [fetchRecordings]);

  return (
    <RecordingsModal
      modalVisible={true}
      setModalVisible={setModalOpen}
      showCloseIcon={true}
      title="Recordings"
      cancelable={false}
      contentContainerStyle={style.mContainer}>
      <View style={style.mbody}>
        <View style={style.ttable}>
          <View style={style.thead}>
            <View style={style.throw}>
              <View style={[style.th, style.plzero]}>
                <Text style={style.thText}>Date/time</Text>
              </View>
              <View style={style.th}>
                <Text style={style.thText}>Actions</Text>
              </View>
            </View>
          </View>
          <ScrollView
            contentContainerStyle={style.scrollgrow}
            showsVerticalScrollIndicator={false}>
            <RecordingsDateView
              status={state.status}
              recordings={state.data.recordings}
              pagination={state.data.pagination}
              error={state.error}
            />
          </ScrollView>
        </View>
      </View>
    </RecordingsModal>
  );
}

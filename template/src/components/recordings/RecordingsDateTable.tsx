import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {style} from './style';
import {RTableHeader, RTableBody, RTableFooter} from './recording-table';
import {useRecording} from '../../subComponents/recording/useRecording';

function RecordingsDateTable() {
  const [state, setState] = React.useState({
    status: 'idle',
    data: {
      pagination: {},
      recordings: [],
    },
    error: null,
  });
  const {
    status,
    data: {pagination, recordings},
    error,
  } = state;

  const {fetchRecordings} = useRecording();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setState(prev => ({...prev, status: 'pending'}));
    fetchRecordings(currentPage).then(
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
  }, [fetchRecordings, currentPage]);

  if (status === 'rejected') {
    return (
      <Text style={[style.ttime, style.pv10, style.ph20]}>
        {error?.message}
      </Text>
    );
  }
  return (
    <View style={style.ttable}>
      <RTableHeader />
      <RTableBody status={status} recordings={recordings} />
      <RTableFooter
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pagination={pagination}
      />
    </View>
  );
}

export default RecordingsDateTable;

import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {style} from './style';
import {RTableHeader, RTableBody, RTableFooter} from './recording-table';
import {useRecording} from '../../subComponents/recording/useRecording';
import events from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';

function RecordingsDateTable(props) {
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

  const defaultPageNumber = 1;
  const [currentPage, setCurrentPage] = useState(defaultPageNumber);

  const onRecordingDeleteCallback = () => {
    setCurrentPage(defaultPageNumber);
    getRecordings(defaultPageNumber);
  };

  useEffect(() => {
    events.on(EventNames.RECORDING_DELETED, onRecordingDeleteCallback);
    return () => {
      events.off(EventNames.RECORDING_DELETED, onRecordingDeleteCallback);
    };
  }, []);

  const getRecordings = pageNumber => {
    setState(prev => ({...prev, status: 'pending'}));
    fetchRecordings(pageNumber).then(
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
  };

  useEffect(() => {
    getRecordings(currentPage);
  }, [currentPage]);

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
      <RTableBody
        status={status}
        recordings={recordings}
        onDeleteAction={props?.onDeleteAction}
      />
      <RTableFooter
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pagination={pagination}
      />
    </View>
  );
}

export default RecordingsDateTable;

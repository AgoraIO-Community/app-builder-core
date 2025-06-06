import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {
  APIStatus,
  FetchRecordingData,
  useRecording,
} from '../../subComponents/recording/useRecording';
import events from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import {style, TableBody, TableHeader} from '../common/data-table';
import Loading from '../../subComponents/Loading';
import ImageIcon from '../../atoms/ImageIcon';
import RecordingItemRow from './RecordingItemRow';

function EmptyTextTrackState() {
  return (
    <View style={style.infotextContainer}>
      <View>
        <ImageIcon
          iconType="plain"
          name="info"
          tintColor={'#777777'}
          iconSize={32}
        />
      </View>
      <View>
        <Text style={[style.infoText, style.pt10, style.pl10]}>
          No text-tracks found for this meeting
        </Text>
      </View>
    </View>
  );
}

const headers = ['', 'Date/Time', 'Duration', 'Actions'];
const defaultPageNumber = 1;

function RecordingsDateTable(props) {
  const [state, setState] = React.useState<{
    status: APIStatus;
    data: {
      recordings: FetchRecordingData['recordings'];
      pagination: FetchRecordingData['pagination'];
    };
    error: Error;
  }>({
    status: 'idle',
    data: {
      recordings: [],
      pagination: {total: 0, limit: 10, page: defaultPageNumber},
    },
    error: null,
  });

  const [currentPage, setCurrentPage] = useState(defaultPageNumber);

  const {fetchRecordings} = useRecording();

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

  const getRecordings = (pageNumber: number) => {
    setState(prev => ({...prev, status: 'pending'}));
    fetchRecordings(pageNumber).then(
      response =>
        setState(prev => ({
          ...prev,
          status: 'resolved',
          data: {
            recordings: response?.recordings,
            pagination: response?.pagination,
          },
          error: null,
        })),
      error => setState(prev => ({...prev, status: 'rejected', error})),
    );
  };

  useEffect(() => {
    getRecordings(currentPage);
  }, [currentPage]);

  if (state.status === 'rejected') {
    return (
      <Text style={[style.ttime, style.pv10, style.ph20]}>
        {state.error?.message}
      </Text>
    );
  }
  return (
    <View style={style.ttable}>
      <TableHeader columns={headers} firstCellStyle={style.thIconCell} />
      <TableBody
        status={state.status}
        items={state.data.recordings}
        loadingComponent={
          <Loading background="transparent" text="Fetching recordingss.." />
        }
        renderRow={item => (
          <RecordingItemRow
            key={item.id}
            item={item}
            onDeleteAction={props?.onDeleteAction}
          />
        )}
        emptyComponent={<EmptyTextTrackState />}
      />
    </View>
  );
}

export default RecordingsDateTable;

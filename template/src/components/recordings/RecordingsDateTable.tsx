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
import GenericPopup from '../common/GenericPopup';
import {downloadS3Link} from '../../utils/common';
import {useControlPermissionMatrix} from '../controls/useControlPermissionMatrix';

function EmptyRecordingState() {
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
          No recording found for this meeting
        </Text>
      </View>
    </View>
  );
}

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
  const canAccessAllTextTracks =
    useControlPermissionMatrix('viewAllTextTracks');

  // message for any download‐error popup
  const [errorSnack, setErrorSnack] = React.useState<string | undefined>();

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
            recordings: response?.recordings || [],
            pagination: response?.pagination || {
              total: 0,
              limit: 10,
              page: defaultPageNumber,
            },
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
  const onTextTrackDownload = (textTrackLink: string) => {
    downloadS3Link(textTrackLink).catch((err: Error) => {
      setErrorSnack(err.message || 'Download failed');
    });
  };

  const headers = canAccessAllTextTracks
    ? ['', 'Date/Time', 'Duration', 'Actions']
    : ['Date/Time', 'Duration', 'Actions'];

  return (
    <View style={style.ttable}>
      <TableHeader
        columns={headers}
        firstCellStyle={canAccessAllTextTracks ? style.thIconCell : {}}
        lastCellStyle={style.alignCellToRight}
      />
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
            onTextTrackDownload={onTextTrackDownload}
            showTextTracks={canAccessAllTextTracks}
          />
        )}
        emptyComponent={<EmptyRecordingState />}
      />
      {/** ERROR POPUP **/}
      {errorSnack && (
        <GenericPopup
          title="Error"
          variant="error"
          message={errorSnack}
          visible={true}
          setVisible={() => setErrorSnack(undefined)}
          onConfirm={() => setErrorSnack(undefined)}
        />
      )}
    </View>
  );
}

export default RecordingsDateTable;

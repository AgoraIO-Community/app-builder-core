import {useState, useCallback, useEffect, useContext} from 'react';
import StorageContext from '../StorageContext';
import {useRoomInfo} from 'customization-api';
import getUniqueID from '../../utils/getUniqueID';
import {logger, LogSource} from '../../logger/AppBuilderLogger';

export interface FetchSTTTranscriptResponse {
  pagination: {limit: number; total: number; page: number};
  stts: {
    id: string;
    download_url: string[];
    title: string;
    product_name: string;
    status: 'COMPLETED' | 'STARTED' | 'INPROGRESS' | 'STOPPING';
    created_at: string;
    ended_at: string;
  }[];
}

export type APIStatus = 'idle' | 'pending' | 'resolved' | 'rejected';

export function useFetchSTTTranscript() {
  const {
    data: {roomId},
  } = useRoomInfo();
  const {store} = useContext(StorageContext);

  const [currentPage, setCurrentPage] = useState(1);

  const [sttState, setSttState] = useState<{
    status: APIStatus;
    data: {
      stts: FetchSTTTranscriptResponse['stts'];
      pagination: FetchSTTTranscriptResponse['pagination'];
    };
    error: Error | null;
  }>({
    status: 'idle',
    data: {stts: [], pagination: {total: 0, limit: 10, page: 1}},
    error: null,
  });

  //–– by‐recording state ––
  const [sttRecState, setSttRecState] = useState<{
    status: APIStatus;
    data: {stts: FetchSTTTranscriptResponse['stts']};
    error: Error | null;
  }>({
    status: 'idle',
    data: {
      stts: [],
    },
    error: null,
  });

  const getSTTs = useCallback(
    (page: number) => {
      setSttState(s => ({...s, status: 'pending', error: null}));
      const reqId = getUniqueID();
      const start = Date.now();

      fetch(`${$config.BACKEND_ENDPOINT}/v1/stt-transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
          'X-Request-Id': reqId,
          'X-Session-Id': logger.getSessionId(),
        },
        body: JSON.stringify({
          passphrase: roomId.host,
          limit: 10,
          page,
        }),
      })
        .then(async res => {
          const json = await res.json();
          const end = Date.now();
          if (!res.ok) {
            logger.error(
              LogSource.NetworkRest,
              'stt-transcript',
              'Fetch STT transcripts failed',
              {
                json,
                start,
                end,
                latency: end - start,
                requestId: reqId,
              },
            );
            throw new Error(json?.error?.message || res.statusText);
          }
          logger.debug(
            LogSource.NetworkRest,
            'stt-transcript',
            'Fetch STT transcripts succeeded',
            {
              json,
              start,
              end,
              latency: end - start,
              requestId: reqId,
            },
          );
          return json as FetchSTTTranscriptResponse;
        })
        .then(({stts = [], pagination = {total: 0, limit: 10, page}}) => {
          setSttState({
            status: 'resolved',
            data: {stts, pagination},
            error: null,
          });
        })
        .catch(err => {
          setSttState(s => ({...s, status: 'rejected', error: err}));
        });
    },
    [roomId.host, store.token],
  );

  // Delete stts
  const deleteTranscript = useCallback(
    async (id: string) => {
      const reqId = getUniqueID();
      const start = Date.now();

      const res = await fetch(
        `${
          $config.BACKEND_ENDPOINT
        }/v1/stt-transcript/${id}?passphrase=${encodeURIComponent(
          roomId.host,
        )}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            authorization: store.token ? `Bearer ${store.token}` : '',
            'X-Request-Id': reqId,
            'X-Session-Id': logger.getSessionId(),
          },
        },
      );
      const end = Date.now();

      if (!res.ok) {
        logger.error(
          LogSource.NetworkRest,
          'stt-transcript',
          'Delete transcript failed',
          {start, end, latency: end - start, requestId: reqId},
        );
        throw new Error(`Delete failed (${res.status})`);
      }
      logger.debug(
        LogSource.NetworkRest,
        'stt-transcript',
        'Delete transcript succeeded',
        {start, end, latency: end - start, requestId: reqId},
      );

      // optimistic remove from paginated list
      setSttState(prev => {
        // remove the deleted item
        const newStts = prev.data.stts.filter(item => item.id !== id);
        // decrement total count
        const newTotal = Math.max(prev.data.pagination.total - 1, 0);
        let newPage = prev.data.pagination.page;
        if (prev.data.stts.length === 1 && newPage > 1) {
          newPage--;
        }
        return {
          ...prev,
          data: {
            stts: newStts,

            pagination: {
              ...prev.data.pagination,
              total: newTotal,
              page: newPage,
            },
          },
        };
      });
    },
    [roomId.host, store.token],
  );

  //–– fetch for a given recording ––
  const getSTTsForRecording = useCallback(
    (recordingId: string) => {
      setSttRecState(r => ({...r, status: 'pending', error: null}));
      const reqId = getUniqueID();
      const start = Date.now();

      fetch(`${$config.BACKEND_ENDPOINT}/v1/recording/stt-transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
          'X-Request-Id': reqId,
          'X-Session-Id': logger.getSessionId(),
        },
        body: JSON.stringify({
          project_id: $config.PROJECT_ID,
          recording_id: recordingId,
        }),
      })
        .then(async res => {
          const json = await res.json();
          const end = Date.now();
          console.log('supriua json', json);
          if (!res.ok) {
            logger.error(
              LogSource.NetworkRest,
              'stt-transcript',
              'Fetch stt-by-recording failed',
              {json, start, end, latency: end - start, requestId: reqId},
            );
            throw new Error(json?.error?.message || res.statusText);
          }
          logger.debug(
            LogSource.NetworkRest,
            'stt-transcript',
            'Fetch stt-by-recording succeeded',
            {json, start, end, latency: end - start, requestId: reqId},
          );
          if (json?.error) {
            logger.debug(
              LogSource.NetworkRest,
              'stt-transcript',
              `No STT records found (code ${json.error.code}): ${json.error.message}`,
              {start, end, latency: end - start, reqId},
            );
            return [];
          } else {
            return json as FetchSTTTranscriptResponse['stts'];
          }
        })
        .then(stts =>
          setSttRecState({status: 'resolved', data: {stts}, error: null}),
        )
        .catch(err =>
          setSttRecState(r => ({...r, status: 'rejected', error: err})),
        );
    },
    [store.token],
  );

  return {
    // stt list
    sttState,
    getSTTs,
    currentPage,
    setCurrentPage,
    // STT per recording
    sttRecState,
    getSTTsForRecording,
    // delete
    deleteTranscript,
  };
}

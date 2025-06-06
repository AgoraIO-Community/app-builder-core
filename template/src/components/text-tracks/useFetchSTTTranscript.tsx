import {useState, useCallback, useContext} from 'react';
import StorageContext from '../StorageContext';
import {useRoomInfo} from 'customization-api';
import getUniqueID from '../../utils/getUniqueID';
import {logger, LogSource} from '../../logger/AppBuilderLogger';

export interface FetchSTTTranscriptResponse {
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

  const [state, setState] = useState<{
    status: APIStatus;
    data: {
      stts: FetchSTTTranscriptResponse['stts'];
    };
    error: Error | null;
  }>({
    status: 'idle',
    data: {
      stts: [],
    },
    error: null,
  });

  const fetchSTTsAPI = useCallback(
    async (recordingId: string) => {
      const requestId = getUniqueID();
      const start = Date.now();

      if (!roomId?.host) {
        const err = new Error('room id is empty');
        return Promise.reject(err);
      }

      try {
        const res = await fetch(
          `${$config.BACKEND_ENDPOINT}/v1/recording/stt-transcript`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              authorization: store.token ? `Bearer ${store.token}` : '',
              'X-Request-Id': requestId,
              'X-Session-Id': logger.getSessionId(),
            },
            body: JSON.stringify({
              project_id: $config.PROJECT_ID,
              recording_id: recordingId,
            }),
          },
        );
        const json = await res.json();
        const end = Date.now();

        if (!res.ok) {
          logger.error(
            LogSource.NetworkRest,
            'stt-transcript',
            'Fetching STT transcripts failed',
            {
              json,
              start,
              end,
              latency: end - start,
              requestId,
            },
          );
          throw new Error(json?.error?.message || 'Unknown fetch error');
        }
        // 200 with error object. {"error":{"message":"no record found","code":615}}
        if (json?.error) {
          logger.debug(
            LogSource.NetworkRest,
            'stt-transcript',
            `No STT records found (code ${json.error.code}): ${json.error.message}`,
            {start, end, latency: end - start, requestId},
          );
          return [];
        }

        logger.debug(
          LogSource.NetworkRest,
          'stt-transcript',
          'Fetched STT transcripts',
          {
            json,
            start,
            end,
            latency: end - start,
            requestId,
          },
        );
        return (json as FetchSTTTranscriptResponse['stts']) || [];
      } catch (err) {
        return Promise.reject(err);
      }
    },
    [roomId?.host, store.token],
  );

  const fetchSTTs = useCallback(
    (recordingId: string) => {
      setState(prev => ({...prev, status: 'pending'}));
      fetchSTTsAPI(recordingId).then(
        sttsArray =>
          setState({
            status: 'resolved',
            data: {
              stts: sttsArray || [],
            },
            error: null,
          }),
        err => setState(prev => ({...prev, status: 'rejected', error: err})),
      );
    },
    [fetchSTTsAPI],
  );

  // const deleteTranscript = useCallback(
  //   async (id: string) => {
  //     const requestId = getUniqueID();
  //     const start = Date.now();

  //     const res = await fetch(
  //       `${
  //         $config.BACKEND_ENDPOINT
  //       }/v1/stt-transcript/${id}?passphrase=${encodeURIComponent(
  //         roomId?.host || '',
  //       )}`,
  //       {
  //         method: 'DELETE',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           authorization: store.token ? `Bearer ${store.token}` : '',
  //           'X-Request-Id': requestId,
  //           'X-Session-Id': logger.getSessionId(),
  //         },
  //       },
  //     );
  //     const end = Date.now();

  //     if (!res.ok) {
  //       logger.error(
  //         LogSource.NetworkRest,
  //         'stt-transcript',
  //         'Deleting STT transcripts failed',
  //         {
  //           json: '',
  //           start,
  //           end,
  //           latency: end - start,
  //           requestId,
  //         },
  //       );
  //       throw new Error(`Delete failed (${res.status})`);
  //     }

  //     logger.debug(
  //       LogSource.NetworkRest,
  //       'stt-transcript',
  //       'Deleted STT transcripts',
  //       {
  //         json: '',
  //         start,
  //         end,
  //         latency: end - start,
  //         requestId,
  //       },
  //     );

  //     // Optimistic local‐state update
  //     setState(prev => {
  //       const newStts = prev.data.stts.filter(item => item.id !== id);
  //       return {
  //         ...prev,
  //         data: {
  //           stts: newStts,
  //         },
  //       };
  //     });
  //   },
  //   [roomId?.host, store.token],
  // );

  return {
    status: state.status as APIStatus,
    stts: state.data.stts,
    error: state.error,
    fetchSTTs,
  };
}

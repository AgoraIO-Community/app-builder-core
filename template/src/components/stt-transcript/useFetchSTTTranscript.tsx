import {useState, useCallback, useEffect, useContext} from 'react';
import StorageContext from '../StorageContext';
import {useRoomInfo} from 'customization-api';
import getUniqueID from '../../utils/getUniqueID';
import {logger, LogSource} from '../../logger/AppBuilderLogger';

export interface FetchSTTTranscriptResponse {
  pagination: {
    limit: number;
    total: number;
    page: number;
  };
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

export function useFetchSTTTranscript(defaultLimit = 10) {
  const {
    data: {roomId},
  } = useRoomInfo();
  const {store} = useContext(StorageContext);
  const [currentPage, setCurrentPage] = useState(1);

  const [state, setState] = useState<{
    status: APIStatus;
    data: {
      stts: FetchSTTTranscriptResponse['stts'];
      pagination: FetchSTTTranscriptResponse['pagination'];
    };
    error: any;
  }>({
    status: 'idle',
    data: {stts: [], pagination: {total: 0, limit: defaultLimit, page: 1}},
    error: null,
  });

  const fetchStts = useCallback(
    async (page: number) => {
      const requestId = getUniqueID();
      const start = Date.now();
      try {
        const res = await fetch(
          `${$config.BACKEND_ENDPOINT}/v1/stt-transcript`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              authorization: store.token ? `Bearer ${store.token}` : '',
              'X-Request-Id': requestId,
              'X-Session-Id': logger.getSessionId(),
            },
            body: JSON.stringify({
              passphrase: roomId.host,
              limit: defaultLimit,
              page,
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
        return json;
      } catch (err) {
        return Promise.reject(err);
      }
    },
    [roomId.host, store.token, defaultLimit],
  );

  const getSTTs = useCallback(
    (page: number) => {
      setState(s => ({...s, status: 'pending'}));
      fetchStts(page).then(
        data =>
          setState({
            status: 'resolved',
            data: {
              stts: data.stts || [],
              pagination: data.pagination || {
                total: 0,
                limit: defaultLimit,
                page: 1,
              },
            },
            error: null,
          }),
        err => setState(s => ({...s, status: 'rejected', error: err})),
      );
    },
    [fetchStts, defaultLimit],
  );

  useEffect(() => {
    getSTTs(currentPage);
  }, [currentPage, getSTTs]);

  return {
    status: state.status as APIStatus,
    stts: state.data.stts,
    pagination: state.data.pagination,
    error: state.error,
    currentPage,
    setCurrentPage,
  };
}

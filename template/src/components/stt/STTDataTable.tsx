import React, {useState, useEffect, useCallback} from 'react';
import {View, Text} from 'react-native';
import {style} from '../recordings/style';
import {STableHeader, STableBody, STableFooter} from './stt-table';
import getUniqueID from '../../utils/getUniqueID';
import {logger, LogSource} from '../../logger/AppBuilderLogger';
import {useRoomInfo} from 'customization-api';
import StorageContext from '../../components/StorageContext';

export interface FetchSTTResponse {
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

function STTDateTable(props) {
  const [state, setState] = React.useState({
    status: 'idle',
    data: {
      pagination: {},
      stts: [],
    },
    error: null,
  });
  const {
    status,
    data: {pagination, stts},
    error,
  } = state;

  const {
    data: {roomId},
  } = useRoomInfo();
  const {store} = React.useContext(StorageContext);
  const defaultPageNumber = 1;
  const [currentPage, setCurrentPage] = useState(defaultPageNumber);

  const fetchSttsAPI = useCallback(
    (page: number) => {
      const requestId = getUniqueID();
      const startReqTs = Date.now();
      logger.debug(LogSource.NetworkRest, 'stt', 'Trying to fetch stts', {
        passphrase: roomId?.host,
        limit: 10,
        page,
        requestId,
        startReqTs,
      });
      return fetch(`${$config.BACKEND_ENDPOINT}/v1/stt-transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: store.token ? `Bearer ${store.token}` : '',
          'X-Request-Id': requestId,
          'X-Session-Id': logger.getSessionId(),
        },
        body: JSON.stringify({
          passphrase: roomId?.host,
          limit: 10,
          page,
        }),
      }).then(async response => {
        const endReqTs = Date.now();
        const data = await response.json();
        if (response.ok) {
          logger.debug(LogSource.NetworkRest, 'stt', 'fetch stt successfull', {
            responseData: data,
            startReqTs,
            endReqTs,
            latency: endReqTs - startReqTs,
            requestId,
          });
          if (data) {
            return data;
          } else {
            return Promise.reject(
              new Error(`No stt found for meeting Id: "${roomId?.host}"`),
            );
          }
        } else {
          const apierror = {
            message: data?.error?.message,
          };
          logger.error(
            LogSource.NetworkRest,
            'recordings_get',
            'Error while fetching recording',
            apierror,
            {
              startReqTs,
              endReqTs,
              latency: endReqTs - startReqTs,
              requestId,
            },
          );
          return Promise.reject(error);
        }
      });
    },
    [roomId?.host, store.token],
  );

  const getSTTs = (pageNumber: number) => {
    setState(prev => ({...prev, status: 'pending'}));
    fetchSttsAPI(pageNumber).then(
      response =>
        setState(prev => ({
          ...prev,
          status: 'resolved',
          data: {
            stts: response?.stts || [],
            pagination: response?.pagination || {},
          },
        })),
      errors =>
        setState(prev => ({...prev, status: 'rejected', error: errors})),
    );
  };

  useEffect(() => {
    getSTTs(currentPage);
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
      <STableHeader />
      <STableBody status={status} stts={stts} />
      <STableFooter
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pagination={pagination}
      />
    </View>
  );
}

export default STTDateTable;

// const RecordingBotWrapper = props => {
//   return (
//     <div style={{backgroundColor: 'lightgray', padding: 20}}>
//       {props.children}
//     </div>
//   );
// };
/*
********************************************
 Copyright © 2024 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useContext, useEffect, useState} from 'react';
import type {RouteProps} from 'react-router';
import StorageContext from '../StorageContext';
import Loading from '../../subComponents/Loading';
import {useIsRecordingBot} from '../../utils/useIsRecordingBot';

interface RecordingBotProps extends RouteProps {
  children: React.ReactNode;
  history: any;
}

const RecordingBotWrapper: React.FC<RecordingBotProps> = props => {
  const {setStore, store} = useContext(StorageContext);
  const [ready, setReady] = useState(false);
  const {recordingBotToken} = useIsRecordingBot();
  useEffect(() => {
    console.log('supriya recordingBotToken: ', recordingBotToken);
    setStore &&
      setStore(prevState => ({
        ...prevState,
        token: recordingBotToken,
      }));
  }, []);

  useEffect(() => {
    store?.token === recordingBotToken && setReady(true);
  }, [store?.token, recordingBotToken]);

  return ready ? <>{props.children}</> : <Loading text={'Loading...'} />;
};

export default RecordingBotWrapper;

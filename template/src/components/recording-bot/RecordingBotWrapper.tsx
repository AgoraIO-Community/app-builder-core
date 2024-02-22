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
import {getRecordingBotToken} from '../../utils/isRecordingBotRoute';
import Loading from '../../subComponents/Loading';

interface RecordingBotProps extends RouteProps {
  children: React.ReactNode;
  history: any;
}

const RecordingBotWrapper: React.FC<RecordingBotProps> = props => {
  console.log('supriya props RecordingBotWrapper: ', props);
  const {setStore} = useContext(StorageContext);
  const [ready, setReady] = useState(false);
  //   setStore && setStore(items => ({...items, token: recordingBotToken}));
  //   console.log('supriya store', store);
  useEffect(() => {
    const recordingBotToken = getRecordingBotToken(props.history);
    console.log('supriya recordingBotToken: ', recordingBotToken);
    setStore &&
      setStore(items => ({
        ...items,
        token: recordingBotToken,
      }));
    setReady(true);
  }, []);

  return ready ? <>{props.children}</> : <Loading text={'Loading...'} />;
};

export default RecordingBotWrapper;

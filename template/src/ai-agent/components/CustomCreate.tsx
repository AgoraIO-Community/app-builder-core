import React, {useEffect, useState} from 'react';
import {
  useRoomInfo,
  useCreateRoom,
  Toast,
  isWebInternal,
  trimText,
  useString,
  useSetRoomInfo,
  isSDK,
  useStorageContext,
  useErrorContext,
  RoomInfoDefaultValue,
  Loading,
} from 'customization-api';
import {Redirect} from '../../components/Router';

const CustomCreate = () => {
  const {
    data: {
      roomId: {host},
    },
  } = useRoomInfo();
  const {setGlobalErrorMessage} = useErrorContext();
  const [roomTitle, onChangeRoomTitle] = useState('');
  const [roomCreated, setRoomCreated] = useState(false);
  const createRoomFun = useCreateRoom();
  const {setRoomInfo} = useSetRoomInfo();
  const {setStore} = useStorageContext();

  useEffect(() => {
    if (isWebInternal() && !isSDK) {
      document.title = $config.APP_NAME;
    }
    console.log('[SDKEvents] Join listener registered');
    return () => {};
  }, []);

  // set default room and username
  useEffect(() => {
    const generateChannelId = () => {
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 16; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }
      return result;
    };
    setStore(prevState => {
      return {
        ...prevState,
        displayName: 'You',
      };
    });
    // set default meeting name
    onChangeRoomTitle('Conversational AI');
  }, []);

  const createRoomAndNavigateToShare = async (
    roomTitle: string,
    enablePSTN: boolean,
    isSeparateHostLink: boolean,
  ) => {
    if (roomTitle !== '') {
      try {
        setRoomInfo(prevState => {
          return {
            ...RoomInfoDefaultValue,
            loginToken: prevState?.loginToken,
          };
        });
        //@ts-ignore
        //isSeparateHostLink will be for internal usage since backend integration is not there
        await createRoomFun(roomTitle, enablePSTN, isSeparateHostLink);

        Toast.show({
          leadingIconName: 'tick-fill',
          type: 'success',
          text1: 'You have joined channel ' + trimText(roomTitle),
          text2: null,
          visibilityTime: 3000,
          primaryBtn: null,
          secondaryBtn: null,
          leadingIcon: null,
        });
        setRoomCreated(true);
      } catch (error) {
        setGlobalErrorMessage({
          name: 'Unable to join channel',
          message: error.message,
        });
      }
    }
  };

  useEffect(() => {
    createRoomAndNavigateToShare(roomTitle?.trim(), false, false);
  }, [roomTitle]);

  return <>{!roomCreated ? <Loading text="" /> : <Redirect to={host} />}</>;
};

export default CustomCreate;

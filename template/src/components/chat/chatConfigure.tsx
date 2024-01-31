import {createHook} from 'customization-implementation';
import React, {createContext, useState, useEffect} from 'react';
import AgoraChat from 'agora-chat';
import {useRoomInfo} from '../room-info/useRoomInfo';
import {useLocalUid} from '../../../agora-rn-uikit';

interface chatConfigureContextInterface {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sendChatSDKMessage: (toUid: number, message: string) => void;
}

export const chatConfigureContext =
  createContext<chatConfigureContextInterface>({
    open: false,
    setOpen: () => {},
    sendChatSDKMessage: () => {},
  });

const ChatConfigure = ({children}) => {
  const [open, setOpen] = useState(false);
  const {data} = useRoomInfo();
  const localUid = useLocalUid();
  const connRef = React.useRef(null);

  useEffect(() => {
    const initializeChatSDK = async () => {
      try {
        const newConn = new AgoraChat.connection({
          appKey: '61464502#1154282', // $config.CHAT_APP_KEY,
        });

        if (data.isHost) {
          // logs in user
          newConn.open({
            user: 'bhupendra',
            pwd: '123',
            // accessToken:
            //   '007eJxTYLjj7DLpzfnlP0KyjI+5nBIqX9GS2Gfyz+Rg/OL98f7uz6wVGNIMU5LNzS2SUlKSzUzMElMs0ozMDCzNzZITjVIMDE2ThW/tTG0IZGT4q+FygJGBlYERCEF8FQZjixSjVANDA92ktDRLXUPD1FTdRKPERF1LS/OUxGSzVNNU02QATokqUQ==',
            success: e => {
              debugger;
              console.log('b-success', e);
            },
            error: e => {
              debugger;
              console.log('b-error', e);
            },
          });
        } else {
          // logs in user
          newConn.open({
            user: 'girish',
            pwd: '123',
            // accessToken:
            //   '007eJxTYLjj7DLpzfnlP0KyjI+5nBIqX9GS2Gfyz+Rg/OL98f7uz6wVGNIMU5LNzS2SUlKSzUzMElMs0ozMDCzNzZITjVIMDE2ThW/tTG0IZGT4q+FygJGBlYERCEF8FQZjixSjVANDA92ktDRLXUPD1FTdRKPERF1LS/OUxGSzVNNU02QATokqUQ==',
            success: e => {
              debugger;
              console.log('g -success', e);
            },
            error: e => {
              debugger;
              console.log('g-error', e);
            },
          });
        }

        // Check login state
        if (newConn.isOpened()) {
          console.log('%cChatSDK: User is logged in', 'color: blue');
        } else {
          console.log('%cChatSDK: User is not logged in', 'color: blue');
        }

        //  event listener for messages
        newConn.addEventHandler('connection&message', {
          // app is connected to chat server
          onConnected: () => {
            console.log('%cChatSDK: connected to chat server', 'color: blue');
          },
          // text message is recieved
          onTextMessage: message => {
            console.log(
              '%cChatSDK: received msg: %s. from: %s',
              'color: blue',
              message.msg,
              message.from,
            );
          },
          // on token expired
          onTokenExpired: () => {
            console.log('%cChatSDK: token has expired', 'color: blue');
          },
          onError: error => {
            console.log('on error', error);
          },
        });
        connRef.current = newConn;
        console.log('%cChatSDK: Initialize Chat SDK: %s', 'color: green');
      } catch (error) {
        console.log(
          '%cChatSDK: initialization error: %s',
          'color: red',
          JSON.stringify(error, null, 2),
        );
      }
    };

    // initializing chat sdk
    initializeChatSDK();
  }, []);

  const sendChatSDKMessage = (toUid: number, message: string) => {
    if (connRef.current) {
      const option = {
        chatType: 'singleChat',
        type: 'txt',
        to: 'girish',
        from: 'bhupendra',
        msg: message,
      };

      //@ts-ignore
      const msg = AgoraChat.message.create(option);

      connRef.current
        .send(msg)
        .then(res => {
          console.log(
            '%cChatSDK: Send private msg success: %s',
            'color: blue',
            res,
          );
        })
        .catch(error => {
          console.log(
            '%cChatSDK: Send private msg fail: %s',
            'color: blue',
            error,
          );
        });
    }
  };
  return (
    <chatConfigureContext.Provider value={{open, setOpen, sendChatSDKMessage}}>
      {children}
    </chatConfigureContext.Provider>
  );
};

export const useChatConfigure = createHook(chatConfigureContext);

export default ChatConfigure;

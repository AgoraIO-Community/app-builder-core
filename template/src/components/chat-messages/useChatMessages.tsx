/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import {createHook} from 'fpe-implementation';
import React, {useState, useEffect, useRef} from 'react';
import {useRenderContext} from 'fpe-api';
import {SidePanelType} from '../../subComponents/SidePanelEnum';
import {useLocalUid, UidType} from '../../../agora-rn-uikit';
import CustomEvents from '../../custom-events';
import {EventNames} from '../../rtm-events';
import {useChatUIControl} from '../chat-ui/useChatUIControl';
import {useChatNotification} from '../chat-notification/useChatNotification';
import Toast from '../../../react-native-toast-message';
import {timeNow} from '../../rtm/utils';
import {useSidePanel} from '../../utils/useSidePanel';

interface ChatMessagesProviderProps {
  children: React.ReactNode;
}
interface messageInterface {
  ts: number;
  msg: string;
}
interface messageStoreInterface extends messageInterface {
  uid: UidType;
}

interface ChatMessagesInterface {
  messageStore: messageStoreInterface | any;
  privateMessageStore: any;
  sendChatMessage: (msg: string, toUid?: UidType) => void;
}

const ChatMessagesContext = React.createContext<ChatMessagesInterface>({
  messageStore: [],
  privateMessageStore: {},
  sendChatMessage: () => {},
});

const ChatMessagesProvider = (props: ChatMessagesProviderProps) => {
  const {renderList} = useRenderContext();
  const localUid = useLocalUid();
  const {setSidePanel} = useSidePanel();
  const {groupActive, selectedChatUserId, setGroupActive} = useChatUIControl();
  const {setUnreadGroupMessageCount, setUnreadIndividualMessageCount} =
    useChatNotification();
  const [messageStore, setMessageStore] = useState<messageStoreInterface[]>([]);
  const [privateMessageStore, setPrivateMessageStore] = useState({});

  const renderListRef = useRef({renderList: renderList});
  const groupActiveRef = useRef<boolean>();
  const individualActiveRef = useRef<string | number>();

  //commented for v1 release
  //const fromText = useString('messageSenderNotificationLabel');
  const fromText = (name: string) => `From : ${name}`;
  useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  useEffect(() => {
    groupActiveRef.current = groupActive;
  }, [groupActive]);

  useEffect(() => {
    individualActiveRef.current = selectedChatUserId;
  }, [selectedChatUserId]);

  React.useEffect(() => {
    const showMessageNotification = (msg: string, uid: string) => {
      Toast.show({
        type: 'success',
        text1: msg.length > 30 ? msg.slice(0, 30) + '...' : msg,
        text2: renderListRef.current.renderList[parseInt(uid)]?.name
          ? fromText(renderListRef.current.renderList[parseInt(uid)]?.name)
          : '',
        visibilityTime: 1000,
        onPress: () => {
          setSidePanel(SidePanelType.Chat);
          setUnreadGroupMessageCount(0);
          setGroupActive(true);
        },
      });
    };
    CustomEvents.on(EventNames.PUBLIC_CHAT_MESSAGE, (data) => {
      showMessageNotification(data.payload.value, data.sender);
      addMessageToStore(parseInt(data.sender), {
        msg: data.payload.value,
        ts: data.ts,
      });
      /**
       * if chat group window is not active.
       * then we will increment the unread count
       */
      if (!groupActiveRef.current) {
        setUnreadGroupMessageCount((prevState) => {
          return prevState + 1;
        });
      }
    });
    CustomEvents.on(EventNames.PRIVATE_CHAT_MESSAGE, (data) => {
      showMessageNotification(data.payload.value, data.sender);
      addMessageToPrivateStore(
        parseInt(data.sender),
        {
          msg: data.payload.value,
          ts: data.ts,
        },
        false,
      );
      /**
       * if user's private window is active.
       * then we will not increment the unread count
       */

      if (!(individualActiveRef.current === parseInt(data.sender))) {
        setUnreadIndividualMessageCount((prevState) => {
          const prevCount =
            prevState && prevState[parseInt(data.sender)]
              ? prevState[parseInt(data.sender)]
              : 0;
          return {
            ...prevState,
            [parseInt(data.sender)]: prevCount + 1,
          };
        });
      }
    });
  }, []);

  const addMessageToStore = (uid: UidType, body: messageInterface) => {
    setMessageStore((m: messageStoreInterface[]) => {
      return [...m, {ts: body.ts, uid, msg: body.msg}];
    });
  };

  const addMessageToPrivateStore = (
    uid: UidType,
    body: messageInterface,
    local: boolean,
  ) => {
    setPrivateMessageStore((state: any) => {
      let newState = {...state};
      newState[uid] !== undefined
        ? (newState[uid] = [
            ...newState[uid],
            {ts: body.ts, uid: local ? localUid : uid, msg: body.msg},
          ])
        : (newState = {
            ...newState,
            [uid]: [{ts: body.ts, uid: local ? localUid : uid, msg: body.msg}],
          });
      return {...newState};
    });
  };

  const sendChatMessage = (msg: string, toUid?: UidType) => {
    if (typeof msg == 'string' && msg.trim() === '') return;
    if (toUid) {
      CustomEvents.send(
        EventNames.PRIVATE_CHAT_MESSAGE,
        {
          value: msg,
        },
        toUid,
      );
      addMessageToPrivateStore(
        toUid,
        {
          msg: msg,
          ts: timeNow(),
        },
        true,
      );
    } else {
      CustomEvents.send(EventNames.PUBLIC_CHAT_MESSAGE, {
        value: msg,
      });
      addMessageToStore(localUid, {
        msg: msg,
        ts: timeNow(),
      });
    }
  };

  return (
    <ChatMessagesContext.Provider
      value={{
        messageStore,
        privateMessageStore,
        sendChatMessage,
      }}>
      {props.children}
    </ChatMessagesContext.Provider>
  );
};

const useChatMessages = createHook(ChatMessagesContext);

export {ChatMessagesProvider, useChatMessages};

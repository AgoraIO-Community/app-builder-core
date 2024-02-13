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
import {createHook} from 'customization-implementation';
import React, {useState, useEffect, useRef, useContext} from 'react';
import {useContent, useRoomInfo} from 'customization-api';
import {SidePanelType} from '../../subComponents/SidePanelEnum';
import {
  useLocalUid,
  UidType,
  ContentInterface,
  DispatchContext,
} from '../../../agora-rn-uikit';
import events, {PersistanceLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import {ChatType, useChatUIControls} from '../chat-ui/useChatUIControls';
import {useChatNotification} from '../chat-notification/useChatNotification';
import Toast from '../../../react-native-toast-message';
import {timeNow} from '../../rtm/utils';
import {useSidePanel} from '../../utils/useSidePanel';
import getUniqueID from '../../utils/getUniqueID';
import {trimText} from '../../utils/common';

interface SDKChatMessagesProviderProps {
  children: React.ReactNode;
  callActive: boolean;
}
export interface messageInterface {
  createdTimestamp: number;
  updatedTimestamp?: number;
  msg: string;
  msgId: string;
  isDeleted: boolean;
}
export interface messageStoreInterface extends messageInterface {
  uid: UidType;
}

interface ChatMessagesInterface {
  messageStore: messageStoreInterface[];
  privateMessageStore: {[key: string]: messageStoreInterface[]};
  addMessageToPrivateStore: (
    uid: UidType,
    body: messageInterface,
    local: boolean,
  ) => void;
  addMessageToStore: (uid: UidType, body: messageInterface) => void;
  showMessageNotification: (
    msg: string,
    uid: string,
    isPrivateMessage?: boolean,
  ) => void;
  openPrivateChat: (toUid: UidType) => void;
}

const ChatMessagesContext = React.createContext<ChatMessagesInterface>({
  messageStore: [],
  privateMessageStore: {},
  addMessageToStore: () => {},
  addMessageToPrivateStore: () => {},
  showMessageNotification: () => {},
  openPrivateChat: () => {},
});

const SDKChatMessagesProvider = (props: SDKChatMessagesProviderProps) => {
  const isToastVisibleRef = useRef(false);
  const previousNotificationRef = useRef([]);
  const timeoutRef = useRef<any>();
  const {callActive} = props;
  const {
    data: {isHost},
  } = useRoomInfo();
  const {dispatch} = useContext(DispatchContext);
  const {defaultContent} = useContent();
  const localUid = useLocalUid();
  const {setSidePanel, sidePanel} = useSidePanel();
  const {chatType, setChatType, privateChatUser, setPrivateChatUser} =
    useChatUIControls();
  const {setUnreadGroupMessageCount, setUnreadIndividualMessageCount} =
    useChatNotification();
  // to store group msgs
  const [messageStore, setMessageStore] = useState<messageStoreInterface[]>([]);
  // to store private msgs
  const [privateMessageStore, setPrivateMessageStore] = useState<{
    [key: string]: messageStoreInterface[];
  }>({});

  const defaultContentRef = useRef({defaultContent: defaultContent});

  const isHostRef = useRef({isHost: isHost});
  const callActiveRef = useRef({callActive: callActive});

  const groupActiveRef = useRef<boolean>(false);
  const individualActiveRef = useRef<string | number>();

  //commented for v1 release
  //const fromText = useString('messageSenderNotificationLabel');
  const fromText = (name: string) => `${name} commented in the public chat`;
  const privateMessageLabel = 'You’ve received a private message';

  useEffect(() => {
    callActiveRef.current.callActive = callActive;
  }, [callActive]);
  useEffect(() => {
    isHostRef.current.isHost = isHost;
  }, [isHost]);

  useEffect(() => {
    defaultContentRef.current.defaultContent = defaultContent;
  }, [defaultContent]);

  useEffect(() => {
    groupActiveRef.current =
      chatType === ChatType.Group && sidePanel === SidePanelType.Chat;
  }, [chatType, sidePanel]);

  useEffect(() => {
    individualActiveRef.current = privateChatUser;
  }, [privateChatUser]);

  const allEqual = arr => arr.every(val => val === arr[0]);
  const openPrivateChat = (uidAsNumber: number) => {
    setPrivateChatUser(uidAsNumber);
    setChatType(ChatType.Private);
    setSidePanel(SidePanelType.Chat);
  };

  //TODO: check why need

  const updateRenderListState = (
    uid: number,
    data: Partial<ContentInterface>,
  ) => {
    dispatch({type: 'UpdateRenderList', value: [uid, data]});
  };

  const addMessageToStore = (uid: UidType, body: messageInterface) => {
    setMessageStore((m: messageStoreInterface[]) => {
      return [
        ...m,
        {
          createdTimestamp: body.createdTimestamp,
          uid,
          msg: body.msg,
          msgId: body.msgId,
          isDeleted: body.isDeleted,
        },
      ];
    });
  };

  const addMessageToPrivateStore = (
    uid: UidType,
    body: messageInterface,
    local: boolean,
  ) => {
    setPrivateMessageStore(state => {
      let newState = {...state};
      newState[uid] !== undefined
        ? (newState[uid] = [
            ...newState[uid],
            {
              createdTimestamp: body.createdTimestamp,
              uid: local ? localUid : uid,
              msg: body.msg,
              msgId: body.msgId,
              isDeleted: body.isDeleted,
            },
          ])
        : (newState = {
            ...newState,
            [uid]: [
              {
                createdTimestamp: body.createdTimestamp,
                uid: local ? localUid : uid,
                msg: body.msg,
                msgId: body.msgId,
                isDeleted: body.isDeleted,
              },
            ],
          });
      return {...newState};
    });
  };

  const showMessageNotification = (
    msg: string,
    uid: string,
    isPrivateMessage: boolean = false,
    forceStop: boolean = false,
  ) => {
    if (isPrivateMessage) {
      // update notification count
      if (!(individualActiveRef.current === Number(uid))) {
        setUnreadIndividualMessageCount(prevState => {
          const prevCount = prevState && prevState[uid] ? prevState[uid] : 0;
          return {
            ...prevState,
            [uid]: prevCount + 1,
          };
        });
      }
    } else {
      if (!groupActiveRef.current) {
        setUnreadGroupMessageCount(prevState => {
          return prevState + 1;
        });
      }
    }

    //don't show group message notification if group chat is open
    if (!isPrivateMessage && groupActiveRef.current) {
      return;
    }
    const uidAsNumber = parseInt(uid);
    //don't show private message notification if private chat is open
    if (isPrivateMessage && uidAsNumber === individualActiveRef.current) {
      return;
    }
    if (forceStop) {
      return;
    }
    clearTimeout(timeoutRef.current);
    isToastVisibleRef.current = true;
    timeoutRef.current = setTimeout(() => {
      isToastVisibleRef.current = false;
      previousNotificationRef.current = [];
    }, 3000);

    previousNotificationRef.current.push({
      isPrivateMessage: isPrivateMessage,
      fromUid: isPrivateMessage ? uidAsNumber : 0,
      from:
        !isPrivateMessage &&
        //@ts-ignore
        defaultContentRef.current.defaultContent[uidAsNumber]?.name
          ? trimText(
              //@ts-ignore
              defaultContentRef.current.defaultContent[uidAsNumber]?.name,
            )
          : '',
    });

    const privateMessages = previousNotificationRef.current.filter(
      i => i.isPrivateMessage,
    );
    const publicMessages = previousNotificationRef.current.filter(
      i => !i.isPrivateMessage,
    );

    //if 1 or more public and private messages
    if (publicMessages && publicMessages.length > 1) {
      const fromNamesArray = publicMessages
        .filter(i => i.from !== undefined && i.from !== null && i.from !== '')
        .map(i => i.from);
      //removing the duplicate names
      const fromNamesArrayUnique = [...new Set(fromNamesArray)];
      //public chat with two name will seperated by "and"
      //public chat with two or more name will have "and more" at the end
      const fromNamesArrayUpdated =
        fromNamesArrayUnique.length > 2
          ? fromNamesArrayUnique
              .slice(0, 2)
              .map((i, index) => (index === 0 ? i + ', ' : i))
              .concat(privateMessages?.length ? ', more' : ' and more')
          : fromNamesArrayUnique.length == 2
          ? fromNamesArrayUnique.map((i, index) =>
              index === 0 ? i + ' and ' : i,
            )
          : fromNamesArrayUnique;
      //converting the names array to string
      const fromNames = fromNamesArrayUpdated.join('');
      Toast.show({
        //@ts-ignore
        update: isToastVisibleRef.current ? true : false,
        primaryBtn: null,
        secondaryBtn: null,
        type: 'info',
        leadingIconName: 'chat-nav',
        text1:
          privateMessages && privateMessages.length
            ? 'New comments in Public & Private Chat'
            : 'New comments in Public Chat',
        text2:
          privateMessages && privateMessages.length
            ? `You have ${publicMessages.length} new messages from ${fromNames} and ${privateMessages.length} Private chat`
            : `You have ${publicMessages.length} new messages from ${fromNames}`,
        visibilityTime: 3000,
        onPress: () => {
          if (isPrivateMessage) {
            openPrivateChat(uidAsNumber);
          } else {
            //move this logic into ChatContainer
            // setUnreadGroupMessageCount(0);
            setPrivateChatUser(0);
            setChatType(ChatType.Group);
            setSidePanel(SidePanelType.Chat);
          }
        },
      });
    }
    //if one or more private message and no public messages
    else if (privateMessages && privateMessages.length > 1) {
      Toast.show({
        //@ts-ignore
        update: isToastVisibleRef.current ? true : false,
        primaryBtn: null,
        secondaryBtn: null,
        type: 'info',
        leadingIconName: 'chat-nav',
        text1: `You’ve received ${privateMessages.length} private messages`,
        text2: ``,
        visibilityTime: 3000,
        onPress: () => {
          const openPrivateChatDetails = allEqual(
            privateMessages.map(i => i.fromUid),
          );
          //if all private message comes from the single user then open details private chat
          if (openPrivateChatDetails) {
            openPrivateChat(privateMessages[0].fromUid);
          }
          //if private message comes from different user then open private tab not the private chatting window
          else {
            //open private tab (not the detail of private chat user)
            setPrivateChatUser(0);
            setChatType(ChatType.Group);
            setSidePanel(SidePanelType.Chat);
          }
        },
      });
    }
    //either 1 public or 1 private message
    else {
      Toast.show({
        //@ts-ignore
        update: isToastVisibleRef.current ? true : false,
        primaryBtn: null,
        secondaryBtn: null,
        type: 'info',
        leadingIconName: 'chat-nav',
        text1: isPrivateMessage
          ? privateMessageLabel
          : //@ts-ignore
          defaultContentRef.current.defaultContent[uidAsNumber]?.name
          ? fromText(
              trimText(
                //@ts-ignore
                defaultContentRef.current.defaultContent[uidAsNumber]?.name,
              ),
            )
          : '',
        text2: isPrivateMessage
          ? ''
          : msg.length > 30
          ? msg.slice(0, 30) + '...'
          : msg,
        visibilityTime: 3000,
        onPress: () => {
          if (isPrivateMessage) {
            openPrivateChat(uidAsNumber);
          } else {
            setPrivateChatUser(0);
            setChatType(ChatType.Group);
            setSidePanel(SidePanelType.Chat);
          }
        },
      });
    }
  };

  return (
    <ChatMessagesContext.Provider
      value={{
        messageStore,
        privateMessageStore,
        addMessageToStore,
        addMessageToPrivateStore,
        showMessageNotification,
        openPrivateChat,
      }}>
      {props.children}
    </ChatMessagesContext.Provider>
  );
};

const useSDKChatMessages = createHook(ChatMessagesContext);

export {SDKChatMessagesProvider, useSDKChatMessages};

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
import RtmEngine from 'agora-react-native-rtm';
import {UidType} from '../../agora-rn-uikit';
import {createContext, SetStateAction} from 'react';

import {ChatMessageType, Reaction} from './chat-messages/useChatMessages';
import {createHook} from 'customization-implementation';

export interface ChatBubbleProps {
  isLocal: boolean;
  message: string;
  createdTimestamp: number;
  updatedTimestamp?: number;
  uid: UidType;
  msgId: string;
  isDeleted: boolean;
  isSameUser: boolean;
  type: ChatMessageType;
  thumb?: string;
  url?: string;
  fileName?: string;
  ext?: string;
  previousMessageCreatedTimestamp?: string;
  reactions?: Reaction[];
  scrollOffset?: number;
  replyToMsgId?: string;
  isLastMsg?: boolean;

  render?: (
    isLocal: boolean,
    message: string,
    createdTimestamp: number,
    uid: UidType,
    msgId: string,
    isDeleted: boolean,
    updatedTimestamp: number,
    isSameUser: boolean,
    type: ChatMessageType,
    thumb?: string,
    url?: string,
    fileName?: string,
    ext?: string,
    previousMessageCreatedTimestamp?: string,
    reactions?: Reaction[],
    replyToMsgId?: string,
  ) => JSX.Element;
}

export interface messageStoreInterface {
  createdTimestamp: number;
  updatedTimestamp?: number;
  uid: UidType;
  msg: string;
}

export enum messageActionType {
  Control = '0',
  Normal = '1',
}

export interface RtmContextInterface {
  isInitialQueueCompleted: boolean;
  hasUserJoinedRTM: boolean;
  rtmInitTimstamp: number;
  engine: RtmEngine;
  localUid: UidType;
  onlineUsersCount: number;
}

export enum controlMessageEnum {
  muteVideo = '1',
  muteAudio = '2',
  muteSingleVideo = '3',
  muteSingleAudio = '4',
  kickUser = '5',
  requestVideo = '6',
  requestAudio = '7',
  //newUserJoined = '8',
  kickScreenshare = '9',
}

const RtmContext = createContext(null as unknown as RtmContextInterface);

const useRtm = createHook(RtmContext);

export {useRtm};
export default RtmContext;

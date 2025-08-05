import {BreakoutGroup} from './reducer';

export type BreakoutGroupAssignStrategy = 'auto' | 'manual' | 'self-select';

export interface AssignOption {
  label: string;
  value: BreakoutGroupAssignStrategy;
  description: string;
}

export interface BreakoutChannelJoinEventPayload {
  data: {
    data: {
      room_id: number;
      room_name: string;
      channel_name: string;
      mainUser: {
        rtc: string;
        uid: number;
        rtm: string;
      };
      screenShare: {
        rtc: string;
        uid: number;
      };
      chat: {
        isGroupOwner: boolean;
        groupId: string;
        userToken: string;
      };
    };
    act: 'CHAN_JOIN'; // e.g., "CHAN_JOIN"
  };
}

export interface BreakoutRoomStateEventPayload {
  data: {
    data: {
      switch_room: boolean;
      session_id: string;
      breakout_room: BreakoutGroup;
    };
    act: 'SYNC_STATE'; // e.g., "CHAN_JOIN"
  };
}
// | {type: 'DELETE_GROUP'; payload: {groupId: string}}
// | {
//     type: 'ADD_PARTICIPANT';
//     payload: {uid: UidType; groupId: string; isHost: boolean};
//   }
// | {
//     type: 'MOVE_PARTICIPANT';
//     payload: {
//       uid: UidType;
//       fromGroupId: string;
//       toGroupId: string;
//       isHost: boolean;
//     };
//   }
// | {type: 'RESET_ALL_PARTICIPANTS'}
// | {type: 'SET_GROUPS'; payload: BreakoutRoomInfo[]}
// | {type: 'RESET_ALL'};

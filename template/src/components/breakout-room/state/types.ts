import {BreakoutGroup, RoomAssignmentStrategy} from './reducer';

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
    srcuid: number;
  };
}

export interface BreakoutRoomSyncStateEventPayload {
  data: {
    data: {
      switch_room: boolean;
      session_id: string;
      breakout_room: BreakoutGroup[];
      assignment_type: RoomAssignmentStrategy;
    };
    act: 'SYNC_STATE';
    srcuid: number;
  };
}
export interface BreakoutRoomAnnouncementEventPayload {
  uid: string;
  timestamp: string;
  announcement: string;
}

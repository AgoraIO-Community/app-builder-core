import {UidType} from '../../../../agora-rn-uikit/src';
import {BreakoutChannelJoinEventPayload} from '../state/types';
import {randomNameGenerator} from '../../../utils';
import {ConnectionState} from 'agora-rtc-sdk-ng';
import RtcEngine from '../../../../bridge/rtc/webNg';

export interface BreakoutGroup {
  id: string;
  name: string;
  participants: {
    hosts: UidType[];
    attendees: UidType[];
  };
}
export interface BreakoutRoomState {
  breakoutSessionId: string;
  breakoutGroups: BreakoutGroup[];
  activeBreakoutGroup: {
    id: number | string;
    name: string;
    channelInfo: BreakoutChannelJoinEventPayload['data']['data'];
  };
  breakoutGroupRtc: {
    connectionState: ConnectionState;
    connectionError: string;
    engine: RtcEngine | null;
  };
}

export const initialBreakoutRoomState: BreakoutRoomState = {
  breakoutSessionId: '',
  breakoutGroups: [],
  activeBreakoutGroup: {
    id: undefined,
    name: '',
    channelInfo: undefined,
  },
  breakoutGroupRtc: {
    connectionState: undefined,
    connectionError: undefined,
    engine: null,
  },
};

export const BreakoutGroupActionTypes = {
  // session
  SET_SESSION_ID: 'BREAKOUT_ROOM/SET_SESSION_ID',
  // group management
  SET_GROUPS: 'BREAKOUT_ROOM/SET_GROUPS',
  CREATE_GROUP: 'BREAKOUT_ROOM/CREATE_GROUP',
  MOVE_PARTICIPANT: 'BREAKOUT_ROOM/MOVE_PARTICIPANT',
  // engine management
  ENGINE_INIT: 'BREAKOUT_ENGINE/ENGINE_INIT',
  ENGINE_SET_CHANNEL_STATUS: 'BREAKOUT_ENGINE/ENGINE_SET_CHANNEL_STATUS',
  ENGINE_LEAVE_AND_DESTROY: 'BREAKOUT_ENGINE/ENGINE_LEAVE_AND_DESTROY',
} as const;

export type BreakoutRoomAction =
  | {
      type: typeof BreakoutGroupActionTypes.SET_SESSION_ID;
      payload: {sessionId: string};
    }
  | {
      type: typeof BreakoutGroupActionTypes.SET_GROUPS;
      payload: BreakoutGroup[];
    }
  | {type: typeof BreakoutGroupActionTypes.CREATE_GROUP}
  | {
      type: typeof BreakoutGroupActionTypes.MOVE_PARTICIPANT;
      payload: {
        uid: UidType;
        fromGroupId: string;
        toGroupId: string;
        isHost: boolean;
      };
    }
  | {
      type: typeof BreakoutGroupActionTypes.ENGINE_INIT;
      payload: {engine: RtcEngine};
    }
  | {
      type: typeof BreakoutGroupActionTypes.ENGINE_SET_CHANNEL_STATUS;
      payload: {status: ConnectionState};
    }
  | {
      type: typeof BreakoutGroupActionTypes.ENGINE_LEAVE_AND_DESTROY;
    };

export const breakoutRoomReducer = (
  state: BreakoutRoomState,
  action: BreakoutRoomAction,
): BreakoutRoomState => {
  switch (action.type) {
    // group management cases
    case BreakoutGroupActionTypes.SET_SESSION_ID: {
      return {...state, breakoutSessionId: action.payload.sessionId};
    }

    case BreakoutGroupActionTypes.SET_GROUPS: {
      return {
        ...state,
        breakoutGroups: action.payload.map(group => ({
          ...group,
          participants: {
            hosts: group.participants?.hosts ?? [],
            attendees: group.participants?.attendees ?? [],
          },
        })),
      };
    }

    case BreakoutGroupActionTypes.CREATE_GROUP: {
      return {
        ...state,
        breakoutGroups: [
          ...state.breakoutGroups,
          {
            name: `Room ${state.breakoutGroups.length + 1}`,
            id: `temp_${randomNameGenerator(6)}`,
            participants: {hosts: [], attendees: []},
          },
        ],
      };
    }

    case BreakoutGroupActionTypes.MOVE_PARTICIPANT: {
      const {uid, fromGroupId, toGroupId, isHost} = action.payload;
      return {
        ...state,
        breakoutGroups: state.breakoutGroups.map(group => {
          // Remove from source group (if fromGroupId exists)
          if (fromGroupId && group.id === fromGroupId) {
            return {
              ...group,
              participants: {
                ...group.participants,
                hosts: isHost
                  ? group.participants.hosts.filter(id => id !== uid)
                  : group.participants.hosts,
                attendees: !isHost
                  ? group.participants.attendees.filter(id => id !== uid)
                  : group.participants.attendees,
              },
            };
          }
          // Add to target group
          if (group.id === toGroupId) {
            return {
              ...group,
              participants: {
                ...group.participants,
                hosts: isHost
                  ? [...group.participants.hosts, uid]
                  : group.participants.hosts,
                attendees: !isHost
                  ? [...group.participants.attendees, uid]
                  : group.participants.attendees,
              },
            };
          }
          return group;
        }),
      };
    }

    // Engine use cases
    case BreakoutGroupActionTypes.ENGINE_INIT:
      return {
        ...state,
        breakoutGroupRtc: {
          ...state.breakoutGroupRtc,
          engine: action.payload.engine,
        },
      };

    case BreakoutGroupActionTypes.ENGINE_SET_CHANNEL_STATUS:
      return {
        ...state,
        breakoutGroupRtc: {
          ...state.breakoutGroupRtc,
          connectionState: action.payload.status,
        },
      };

    default:
      return state;
  }
};

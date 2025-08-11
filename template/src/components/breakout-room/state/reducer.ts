import {ContentInterface, UidType} from '../../../../agora-rn-uikit/src';
import {BreakoutChannelJoinEventPayload} from '../state/types';
import {randomNameGenerator} from '../../../utils';

export enum RoomAssignmentStrategy {
  AUTO_ASSIGN = 'auto-assign',
  MANUAL_ASSIGN = 'manual-assign',
  NO_ASSIGN = 'no-assign',
}

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
  unassignedParticipants: {uid: UidType; user: ContentInterface}[];
  assignmentStrategy: RoomAssignmentStrategy;
  activeBreakoutGroup: {
    id: number | string;
    name: string;
    channelInfo: BreakoutChannelJoinEventPayload['data']['data'];
  };
}

export const initialBreakoutRoomState: BreakoutRoomState = {
  breakoutSessionId: '',
  assignmentStrategy: RoomAssignmentStrategy.AUTO_ASSIGN,
  unassignedParticipants: [],
  breakoutGroups: [
    {
      name: 'Room 1',
      id: `temp_${randomNameGenerator(6)}`,
      participants: {hosts: [], attendees: []},
    },
    {
      name: 'Room 2',
      id: `temp_${randomNameGenerator(6)}`,
      participants: {hosts: [], attendees: []},
    },
  ],
  activeBreakoutGroup: {
    id: undefined,
    name: '',
    channelInfo: undefined,
  },
};

export const BreakoutGroupActionTypes = {
  // session
  SET_SESSION_ID: 'BREAKOUT_ROOM/SET_SESSION_ID',
  // strategy
  SET_ASSIGNMENT_STRATEGY: 'BREAKOUT_ROOM/SET_ASSIGNMENT_STRATEGY',
  // Group management
  SET_GROUPS: 'BREAKOUT_ROOM/SET_GROUPS',
  CREATE_GROUP: 'BREAKOUT_ROOM/CREATE_GROUP',
  // Participants Assignment
  UPDATE_UNASSIGNED_PARTICIPANTS:
    'BREAKOUT_ROOM/UPDATE_UNASSIGNED_PARTICIPANTS',
  ASSIGN_PARTICPANTS: 'BREAKOUT_ROOM/ASSIGN_PARTICPANTS',
  MOVE_PARTICIPANT: 'BREAKOUT_ROOM/MOVE_PARTICIPANT',
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
  | {
      type: typeof BreakoutGroupActionTypes.SET_ASSIGNMENT_STRATEGY;
      payload: {
        strategy: RoomAssignmentStrategy;
      };
    }
  | {type: typeof BreakoutGroupActionTypes.CREATE_GROUP}
  | {
      type: typeof BreakoutGroupActionTypes.UPDATE_UNASSIGNED_PARTICIPANTS;
      payload: {
        unassignedParticipants: {uid: UidType; user: ContentInterface}[];
      };
    }
  | {
      type: typeof BreakoutGroupActionTypes.ASSIGN_PARTICPANTS;
    }
  | {
      type: typeof BreakoutGroupActionTypes.MOVE_PARTICIPANT;
      payload: {
        uid: UidType;
        fromGroupId: string;
        toGroupId: string;
      };
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

    case BreakoutGroupActionTypes.UPDATE_UNASSIGNED_PARTICIPANTS: {
      return {
        ...state,
        unassignedParticipants: action.payload.unassignedParticipants || [],
      };
    }

    case BreakoutGroupActionTypes.SET_ASSIGNMENT_STRATEGY: {
      return {
        ...state,
        assignmentStrategy: action.payload.strategy,
      };
    }

    case BreakoutGroupActionTypes.ASSIGN_PARTICPANTS: {
      const selectedStrategy = state.assignmentStrategy;
      const roomAssignments = new Map<string, UidType[]>();

      // Initialize empty arrays for each room
      state.breakoutGroups.forEach(room => {
        roomAssignments.set(room.id, []);
      });

      let assignedParticipantUids: UidType[] = [];
      // AUTO ASSIGN Simple round-robin assignment (no capacity limits)
      if (selectedStrategy === RoomAssignmentStrategy.AUTO_ASSIGN) {
        let roomIndex = 0;
        const roomIds = state.breakoutGroups.map(room => room.id);
        state.unassignedParticipants.forEach(participant => {
          const currentRoomId = roomIds[roomIndex];
          // Assign participant to current room
          roomAssignments.get(currentRoomId)!.push(participant.uid);
          // Move it to assigned list
          assignedParticipantUids.push(participant.uid);
          // Move to next room for round-robin
          roomIndex = (roomIndex + 1) % roomIds.length;
        });
      }
      // Update breakoutGroups with new assignments
      const updatedBreakoutGroups = state.breakoutGroups.map(group => {
        const roomParticipants = roomAssignments.get(group.id) || [];
        return {
          ...group,
          participants: {
            hosts: [],
            attendees: roomParticipants || [],
          },
        };
      });

      // Remove assigned participants from unassignedParticipants
      const updatedUnassignedParticipants = state.unassignedParticipants.filter(
        participant => !assignedParticipantUids.includes(participant.uid),
      );

      return {
        ...state,
        unassignedParticipants: updatedUnassignedParticipants,
        breakoutGroups: updatedBreakoutGroups,
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
      const {uid, fromGroupId, toGroupId} = action.payload;
      return {
        ...state,
        breakoutGroups: state.breakoutGroups.map(group => {
          // Remove from source group (if fromGroupId exists)
          if (fromGroupId && group.id === fromGroupId) {
            return {
              ...group,
              participants: {
                ...group.participants,
                hosts: true
                  ? group.participants.hosts.filter(id => id !== uid)
                  : group.participants.hosts,
                attendees: false
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
                hosts: true
                  ? [...group.participants.hosts, uid]
                  : group.participants.hosts,
                attendees: false
                  ? [...group.participants.attendees, uid]
                  : group.participants.attendees,
              },
            };
          }
          return group;
        }),
      };
    }

    default:
      return state;
  }
};

import {ContentInterface, UidType} from '../../../../agora-rn-uikit/src';
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
  canUserSwitchRoom: boolean;
}

export const initialBreakoutGroups = [
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
];

export const initialBreakoutRoomState: BreakoutRoomState = {
  breakoutSessionId: '',
  assignmentStrategy: RoomAssignmentStrategy.AUTO_ASSIGN,
  canUserSwitchRoom: false,
  unassignedParticipants: [],
  breakoutGroups: [],
};

export const BreakoutGroupActionTypes = {
  // Initial state
  SYNC_STATE: 'BREAKOUT_ROOM/SYNC_STATE',
  // session
  SET_SESSION_ID: 'BREAKOUT_ROOM/SET_SESSION_ID',
  // strategy
  SET_ASSIGNMENT_STRATEGY: 'BREAKOUT_ROOM/SET_ASSIGNMENT_STRATEGY',
  // switch room
  SET_ALLOW_PEOPLE_TO_SWITCH_ROOM:
    'BREAKOUT_ROOM/SET_ALLOW_PEOPLE_TO_SWITCH_ROOM',
  // Group management
  SET_GROUPS: 'BREAKOUT_ROOM/SET_GROUPS',
  UPDATE_GROUPS_IDS: 'BREAKOUT_ROOM/UPDATE_GROUPS_IDS',
  CREATE_GROUP: 'BREAKOUT_ROOM/CREATE_GROUP',
  RENAME_GROUP: 'BREAKOUT_ROOM/RENAME_GROUP',
  EXIT_GROUP: 'BREAKOUT_ROOM/EXIT_GROUP',
  CLOSE_GROUP: 'BREAKOUT_ROOM/CLOSE_GROUP',
  CLOSE_ALL_GROUPS: 'BREAKOUT_ROOM/CLOSE_ALL_GROUPS',
  // Participants Assignment
  UPDATE_UNASSIGNED_PARTICIPANTS:
    'BREAKOUT_ROOM/UPDATE_UNASSIGNED_PARTICIPANTS',
  ASSIGN_PARTICPANTS: 'BREAKOUT_ROOM/ASSIGN_PARTICPANTS',
  MOVE_PARTICIPANT_TO_MAIN: 'BREAKOUT_ROOM/MOVE_PARTICIPANT_TO_MAIN',
  MOVE_PARTICIPANT_TO_GROUP: 'BREAKOUT_ROOM/MOVE_PARTICIPANT_TO_GROUP',
} as const;

export type BreakoutRoomAction =
  | {
      type: typeof BreakoutGroupActionTypes.SYNC_STATE;
      payload: {
        sessionId: BreakoutRoomState['breakoutSessionId'];
        switchRoom: BreakoutRoomState['canUserSwitchRoom'];
        rooms: BreakoutRoomState['breakoutGroups'];
      };
    }
  | {
      type: typeof BreakoutGroupActionTypes.SET_SESSION_ID;
      payload: {sessionId: string};
    }
  | {
      type: typeof BreakoutGroupActionTypes.SET_ASSIGNMENT_STRATEGY;
      payload: {
        strategy: RoomAssignmentStrategy;
      };
    }
  | {
      type: typeof BreakoutGroupActionTypes.SET_ALLOW_PEOPLE_TO_SWITCH_ROOM;
      payload: {
        canUserSwitchRoom: boolean;
      };
    }
  | {
      type: typeof BreakoutGroupActionTypes.SET_GROUPS;
      payload: BreakoutGroup[];
    }
  | {
      type: typeof BreakoutGroupActionTypes.UPDATE_GROUPS_IDS;
      payload: BreakoutGroup[];
    }
  | {type: typeof BreakoutGroupActionTypes.CREATE_GROUP}
  | {
      type: typeof BreakoutGroupActionTypes.CLOSE_GROUP;
      payload: {
        groupId: string;
      };
    }
  | {type: typeof BreakoutGroupActionTypes.CLOSE_ALL_GROUPS}
  | {
      type: typeof BreakoutGroupActionTypes.RENAME_GROUP;
      payload: {
        newName: string;
        groupId: string;
      };
    }
  | {
      type: typeof BreakoutGroupActionTypes.EXIT_GROUP;
      payload: {
        user: ContentInterface;
        fromGroupId: string;
      };
    }
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
      type: typeof BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_MAIN;
      payload: {
        user: ContentInterface;
        fromGroupId: string;
      };
    }
  | {
      type: typeof BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_GROUP;
      payload: {
        user: ContentInterface;
        fromGroupId: string;
        toGroupId: string;
      };
    };

export const breakoutRoomReducer = (
  state: BreakoutRoomState,
  action: BreakoutRoomAction,
): BreakoutRoomState => {
  switch (action.type) {
    case BreakoutGroupActionTypes.SYNC_STATE: {
      return {
        ...state,
        breakoutSessionId: action.payload.sessionId,
        canUserSwitchRoom: action.payload.switchRoom,
        breakoutGroups: action.payload.rooms.map(group => ({
          ...group,
          participants: {
            hosts: group.participants?.hosts ?? [],
            attendees: group.participants?.attendees ?? [],
          },
        })),
      };
    }
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

    case BreakoutGroupActionTypes.UPDATE_GROUPS_IDS: {
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

    case BreakoutGroupActionTypes.SET_ALLOW_PEOPLE_TO_SWITCH_ROOM: {
      return {
        ...state,
        canUserSwitchRoom: action.payload.canUserSwitchRoom,
      };
    }

    case BreakoutGroupActionTypes.ASSIGN_PARTICPANTS: {
      const selectedStrategy = state.assignmentStrategy;
      const roomAssignments = new Map<
        string,
        {hosts: UidType[]; attendees: UidType[]}
      >();

      // Initialize empty arrays for each room
      state.breakoutGroups.forEach(room => {
        roomAssignments.set(room.id, {hosts: [], attendees: []});
      });

      let assignedParticipantUids: UidType[] = [];
      // AUTO ASSIGN Simple round-robin assignment (no capacity limits)
      if (selectedStrategy === RoomAssignmentStrategy.AUTO_ASSIGN) {
        let roomIndex = 0;
        const roomIds = state.breakoutGroups.map(room => room.id);
        state.unassignedParticipants.forEach(participant => {
          const currentRoomId = roomIds[roomIndex];
          const roomAssignment = roomAssignments.get(currentRoomId)!;
          // Assign participant based on their isHost status (string "true"/"false")
          if (participant.user.isHost === 'true') {
            roomAssignment.hosts.push(participant.uid);
          } else {
            roomAssignment.attendees.push(participant.uid);
          }
          // Move it to assigned list
          assignedParticipantUids.push(participant.uid);
          // Move to next room for round-robin
          roomIndex = (roomIndex + 1) % roomIds.length;
        });
      }
      // Update breakoutGroups with new assignments
      const updatedBreakoutGroups = state.breakoutGroups.map(group => {
        const roomParticipants = roomAssignments.get(group.id) || {
          hosts: [],
          attendees: [],
        };
        return {
          ...group,
          participants: {
            hosts: roomParticipants.hosts,
            attendees: roomParticipants.attendees,
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

    case BreakoutGroupActionTypes.EXIT_GROUP: {
      // Same logic as MOVE_PARTICIPANT_TO_MAIN but more explicit
      const {user, fromGroupId} = action.payload;
      return {
        ...state,
        breakoutGroups: state.breakoutGroups.map(group => {
          if (group.id === fromGroupId) {
            return {
              ...group,
              participants: {
                hosts: group.participants.hosts.filter(uid => uid !== user.uid),
                attendees: group.participants.attendees.filter(
                  uid => uid !== user.uid,
                ),
              },
            };
          }
          return group;
        }),
      };
    }

    case BreakoutGroupActionTypes.CLOSE_GROUP: {
      const {groupId} = action.payload;
      return {
        ...state,
        breakoutGroups: state.breakoutGroups.filter(
          room => room.id !== groupId,
        ),
      };
    }

    case BreakoutGroupActionTypes.CLOSE_ALL_GROUPS: {
      return {
        ...state,
        breakoutGroups: [],
      };
    }

    case BreakoutGroupActionTypes.RENAME_GROUP: {
      const {groupId, newName} = action.payload;
      return {
        ...state,
        breakoutGroups: state.breakoutGroups.map(group =>
          group.id === groupId ? {...group, name: newName} : group,
        ),
      };
    }

    case BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_MAIN: {
      const {user, fromGroupId} = action.payload;
      return {
        ...state,
        breakoutGroups: state.breakoutGroups.map(group => {
          // Remove participant from their current breakout group
          if (fromGroupId && group.id === fromGroupId) {
            return {
              ...group,
              participants: {
                ...group.participants,
                hosts: group.participants.hosts.filter(id => id !== user.uid),
                attendees: group.participants.attendees.filter(
                  id => id !== user.uid,
                ),
              },
            };
          }
          return group;
        }),
      };
    }

    case BreakoutGroupActionTypes.MOVE_PARTICIPANT_TO_GROUP: {
      const {user, fromGroupId, toGroupId} = action.payload;
      return {
        ...state,
        breakoutGroups: state.breakoutGroups.map(group => {
          // Remove from source group (if fromGroupId exists)
          if (fromGroupId && group.id === fromGroupId) {
            return {
              ...group,
              participants: {
                ...group.participants,
                hosts: group.participants.hosts.filter(id => id !== user.uid),
                attendees: group.participants.attendees.filter(
                  id => id !== user.uid,
                ),
              },
            };
          }
          // Add to target group
          if (group.id === toGroupId) {
            const isHost = user.isHost === 'true';
            return {
              ...group,
              participants: {
                ...group.participants,
                hosts: isHost
                  ? [...group.participants.hosts, user.uid]
                  : group.participants.hosts,
                attendees: !isHost
                  ? [...group.participants.attendees, user.uid]
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

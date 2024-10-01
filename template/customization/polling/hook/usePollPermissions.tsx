import {useMemo} from 'react';
import {useLocalUid, useRoomInfo} from 'customization-api';
import {PollItem, PollStatus} from '../context/poll-context';

interface PollPermissions {
  canEdit: boolean;
  canEnd: boolean;
  canViewResults: boolean;
  canViewWhoVoted: boolean;
  // canReply: boolean;
}

interface UsePollPermissionsProps {
  pollItem: PollItem; // The current poll object
}

export const usePollPermissions = ({
  pollItem,
}: UsePollPermissionsProps): PollPermissions => {
  const localUid = useLocalUid();
  const {
    data: {isHost},
  } = useRoomInfo();
  // Calculate permissions using useMemo to optimize performance
  const permissions = useMemo(() => {
    const isPollCreator = pollItem?.createdBy === localUid || false;
    const isPollHost = isHost && isPollCreator;
    const isPollCoHost = isHost && !isPollCreator;
    const isPollAttendee = !isHost && !isPollCreator;

    // Determine if the user can edit the poll
    const canEdit = isPollHost;
    const canEnd = isPollHost && pollItem?.status === PollStatus.ACTIVE;
    const canViewResults =
      (isPollAttendee && pollItem?.share_attendee) ||
      (isPollCoHost && pollItem?.share_host);

    const canViewWhoVoted = isPollCreator || !pollItem?.anonymous;
    // // Determine if the user can reply to the poll (e.g., if the poll is active)
    // const canReply = poll.status === PollStatus.ACTIVE;

    // // Determine if the user can view results (e.g., if they have replied to the poll or if the poll is finished)
    // const canViewResults = isHost;

    return {canEdit, canEnd, canViewResults, canViewWhoVoted};
  }, [localUid, pollItem, isHost]);

  return permissions;
};

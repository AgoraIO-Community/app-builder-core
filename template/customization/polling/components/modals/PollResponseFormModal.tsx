import React, {useState} from 'react';
import {
  BaseModal,
  BaseModalCloseIcon,
  BaseModalContent,
  BaseModalTitle,
} from '../../ui/BaseModal';
import {
  PollResponseFormComplete,
  PollRenderResponseForm,
} from '../form/poll-response-forms';
import {PollTaskRequestTypes, usePoll} from '../../context/poll-context';

export default function PollResponseFormModal() {
  const {
    polls,
    launchPollId,
    sendResponseToPoll,
    closeCurrentModal,
    handlePollTaskRequest,
  } = usePoll();
  const [hasResponded, setHasResponded] = useState<boolean>(false);

  const onFormComplete = (responses: string | string[]) => {
    sendResponseToPoll(pollItem, responses);
    if (pollItem.share_attendee || pollItem.share_host) {
      handlePollTaskRequest(PollTaskRequestTypes.VIEW_DETAILS, pollItem.id);
    } else {
      setHasResponded(true);
    }
  };

  // Check if launchPollId is valid and if the poll exists in the polls object
  const pollItem = launchPollId ? polls[launchPollId] : null;

  if (!pollItem) {
    return (
      <BaseModal visible={true} onClose={closeCurrentModal}>
        <BaseModalTitle>
          <p>No poll available</p>
          <BaseModalCloseIcon onClose={closeCurrentModal} />
        </BaseModalTitle>
        <BaseModalContent>
          <p>Poll data is not available or invalid.</p>
        </BaseModalContent>
      </BaseModal>
    );
  }
  return (
    <BaseModal visible={true} onClose={closeCurrentModal}>
      <BaseModalTitle
        title={
          hasResponded
            ? 'Here are the poll results 🎉'
            : 'Here’s a poll for you'
        }>
        <BaseModalCloseIcon onClose={closeCurrentModal} />
      </BaseModalTitle>
      <BaseModalContent>
        {hasResponded ? (
          <PollResponseFormComplete />
        ) : (
          <>
            <PollRenderResponseForm
              onFormComplete={onFormComplete}
              pollItem={pollItem}
            />
          </>
        )}
      </BaseModalContent>
    </BaseModal>
  );
}

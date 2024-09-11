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
import {usePoll, PollTaskRequestTypes} from '../../context/poll-context';
import PollAvatarHeader from '../PollAvatarHeader';

export default function PollResponseFormModal() {
  const {
    polls,
    launchPollId,
    sendResponseToPoll,
    handlePollTaskRequest,
    closeCurrentModal,
  } = usePoll();
  const [hasResponded, setHasResponded] = useState<boolean>(false);

  const pollItem = polls[launchPollId];

  const onFormComplete = (responses: string | string[]) => {
    sendResponseToPoll(pollItem, responses);
    if (pollItem.share) {
      handlePollTaskRequest(PollTaskRequestTypes.VIEW_DETAILS, pollItem.id);
    } else {
      setHasResponded(true);
    }
  };

  return (
    <BaseModal visible={true}>
      <BaseModalTitle>
        <PollAvatarHeader pollItem={pollItem} />
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

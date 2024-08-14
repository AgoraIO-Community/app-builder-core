import React, {useState} from 'react';
import {
  BaseModal,
  BaseModalCloseIcon,
  BaseModalTitle,
} from '../../ui/BaseModal';
import {
  PollResponseFormComplete,
  PollResponseQuestionForm,
  PollResponseMCQForm,
} from '../form/poll-response-forms';
import {PollKind, usePoll} from '../../context/poll-context';
import PollAvatarHeader from '../PollAvatarHeader';

export default function PollResponseFormModal() {
  const {
    polls,
    launchPollId,
    sendResponseToPoll,
    goToShareResponseModal,
    closeCurrentModal,
  } = usePoll();
  const [hasResponded, setHasResponded] = useState<boolean>(false);

  const pollItem = polls[launchPollId];

  const onFormComplete = (responses: string | string[]) => {
    sendResponseToPoll(pollItem, responses);
    if (pollItem.share) {
      goToShareResponseModal(pollItem.id);
    } else {
      setHasResponded(true);
    }
  };

  function renderForm(type: PollKind) {
    switch (type) {
      case PollKind.OPEN_ENDED:
        return (
          <PollResponseQuestionForm
            pollItem={pollItem}
            onComplete={onFormComplete}
          />
        );
      case PollKind.MCQ:
        return (
          <PollResponseMCQForm
            pollItem={pollItem}
            onComplete={onFormComplete}
          />
        );

      default:
        return <></>;
    }
  }

  return (
    <BaseModal visible={true}>
      <BaseModalTitle>
        <PollAvatarHeader pollItem={pollItem} />
        {hasResponded && <BaseModalCloseIcon onClose={closeCurrentModal} />}
      </BaseModalTitle>
      {hasResponded ? <PollResponseFormComplete /> : renderForm(pollItem.type)}
    </BaseModal>
  );
}

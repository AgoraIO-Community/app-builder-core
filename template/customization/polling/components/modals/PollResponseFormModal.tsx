import React, {useState} from 'react';
import {BaseModal, BaseModalTitle} from '../../ui/BaseModal';
import {
  PollResponseFormComplete,
  PollResponseFormModalTitle,
  PollResponseQuestionForm,
  PollResponseMCQForm,
} from '../form/poll-response-forms';
import {PollKind, usePoll} from '../../context/poll-context';

export default function PollResponseFormModal() {
  const {polls, launchPollId, sendResponseToPoll, goToShareResponseModal} =
    usePoll();
  const [hasResponded, setHasResponded] = useState<boolean>(false);

  const pollItem = polls[launchPollId];

  const onFormComplete = (responses: string | string[]) => {
    sendResponseToPoll(pollItem, responses);
    if (pollItem.share) {
      goToShareResponseModal();
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
        <PollResponseFormModalTitle pollItem={pollItem} />
      </BaseModalTitle>
      {hasResponded ? <PollResponseFormComplete /> : renderForm(pollItem.type)}
    </BaseModal>
  );
}

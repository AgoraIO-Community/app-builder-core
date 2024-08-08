import React, {useState} from 'react';
import {BaseModal, BaseModalTitle} from '../../ui/BaseModal';
import {
  PollResponseFormComplete,
  PollResponseFormModalTitle,
  PollResponseQuestionForm,
} from '../form/poll-response-forms';
import {PollKind, usePoll} from '../../context/poll-context';

export default function PollResponseFormModal() {
  const {polls, launchPollId, goToShareResponseModal} = usePoll();
  const [hasResponded, setHasResponded] = useState<boolean>(false);
  const pollItem = polls[launchPollId];

  const onFormComplete = () => {
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

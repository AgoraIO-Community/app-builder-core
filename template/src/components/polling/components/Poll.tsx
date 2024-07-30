import React from 'react';
import {PollProvider} from '../context/poll-context';
import {PollFormProvider, usePollForm} from '../context/poll-form-context';
import SelectNewPollTypeModal from '../modal/SelectNewPollTypeModal';
import CreatePollModal from '../modal/CreatePollModal';
import PollPreviewModal from '../modal/PollPreviewModal';

function Poll() {
  return (
    <PollProvider>
      <PollFormProvider>
        <PollForms />
      </PollFormProvider>
    </PollProvider>
  );
}

export default Poll;

function PollForms() {
  const {state} = usePollForm();
  const {currentStep} = state;

  function renderSwitch() {
    switch (currentStep) {
      case 'SELECT_POLL':
        return <SelectNewPollTypeModal visible={true} />;
      case 'CREATE_POLL':
        return <CreatePollModal visible={true} />;
      case 'PREVIEW_POLL':
        return <PollPreviewModal visible={true} />;
      default:
        return <></>;
    }
  }

  return <>{renderSwitch()}</>;
}

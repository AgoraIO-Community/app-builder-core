import React from 'react';
import {PollProvider, usePoll} from '../context/poll-context';
import PollFormModal from './modals/PollFormModal';
import {PollEventsProvider, PollEventsSubscriber} from '../context/poll-events';
import PollResponseFormModal from './modals/PollResponseFormModal';

function Poll({children}: {children?: React.ReactNode}) {
  return (
    <PollEventsProvider>
      <PollProvider>
        <PollEventsSubscriber>{children}</PollEventsSubscriber>
        <PollModals />
      </PollProvider>
    </PollEventsProvider>
  );
}

function PollModals() {
  const {currentStep} = usePoll();
  return (
    <>
      <PollFormModal />
      {currentStep === 'RESPONSE_POLL' && <PollResponseFormModal />}
    </>
  );
}
export default Poll;

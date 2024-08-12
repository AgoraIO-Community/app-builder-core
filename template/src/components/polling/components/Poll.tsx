import React from 'react';
import {PollProvider, usePoll} from '../context/poll-context';
import PollFormWizardModal from './modals/PollFormWizardModal';
import {PollEventsProvider, PollEventsSubscriber} from '../context/poll-events';
import PollResponseFormModal from './modals/PollResponseFormModal';
import SharePollModal from './modals/SharePollModal';

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
  const {currentStep, launchPollId, polls} = usePoll();
  console.log('supriya polls data chnaged: ', polls);
  return (
    <>
      {currentStep === 'CREATE_POLL' && <PollFormWizardModal />}
      {currentStep === 'RESPOND_TO_POLL' && launchPollId && (
        <PollResponseFormModal />
      )}
      {currentStep === 'SHARE_POLL' && <SharePollModal />}
    </>
  );
}
export default Poll;

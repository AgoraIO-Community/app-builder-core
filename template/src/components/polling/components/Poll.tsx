import React from 'react';
import {PollModalState, PollProvider, usePoll} from '../context/poll-context';
import PollFormWizardModal from './modals/PollFormWizardModal';
import {PollEventsProvider, PollEventsSubscriber} from '../context/poll-events';
import PollResponseFormModal from './modals/PollResponseFormModal';
import SharePollModal from './modals/SharePollModal';
// const DraftPollModal = React.lazy(() => import('./DraftPollModal'));
// const RespondToPollModal = React.lazy(() => import('./RespondToPollModal'));
// const SharePollResultModal = React.lazy(() => import('./SharePollResultModal'));

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
      {currentStep === PollModalState.DRAFT_POLL && <PollFormWizardModal />}
      {currentStep === PollModalState.RESPOND_TO_POLL && launchPollId && (
        <PollResponseFormModal />
      )}
      {currentStep === PollModalState.SHARE_POLL_RESULTS && <SharePollModal />}
    </>
    //    <Suspense fallback={<div>Loading...</div>}>
    //    {activePollModal === PollAction.DraftPoll && <DraftPollModal />}
    //    {activePollModal === PollAction.RespondToPoll && <RespondToPollModal />}
    //    {activePollModal === PollAction.SharePollResult && <SharePollResultModal />}
    //  </Suspense>
  );
}
export default Poll;

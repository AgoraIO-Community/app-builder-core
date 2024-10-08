import React from 'react';
import {PollModalState, PollProvider, usePoll} from '../context/poll-context';
import PollFormWizardModal from './modals/PollFormWizardModal';
import {PollEventsProvider, PollEventsSubscriber} from '../context/poll-events';
import PollResponseFormModal from './modals/PollResponseFormModal';
import PollResultModal from './modals/PollResultModal';
import {log} from '../helpers';
// TODO:SUP
// const DraftPollModal = React.lazy(() => import('./DraftPollModal'));
// const RespondToPollModal = React.lazy(() => import('./RespondToPollModal'));
// const SharePollResultModal = React.lazy(() => import('./SharePollResultModal'));

function Poll({children}: {children?: React.ReactNode}) {
  return (
    <PollEventsProvider>
      <PollProvider>
        <PollEventsSubscriber>
          {children}
          <PollModals />
        </PollEventsSubscriber>
      </PollProvider>
    </PollEventsProvider>
  );
}

function PollModals() {
  const {currentModal, launchPollId, viewResultPollId, polls, editFormObject} =
    usePoll();
  // Log only in development mode to prevent performance hits
  if (process.env.NODE_ENV === 'development') {
    log('polls data changed: ', polls);
  }
  return (
    <>
      {currentModal === PollModalState.DRAFT_POLL && (
        <PollFormWizardModal formObject={editFormObject} />
      )}
      {currentModal === PollModalState.RESPOND_TO_POLL &&
        launchPollId &&
        polls[launchPollId] && <PollResponseFormModal />}
      {currentModal === PollModalState.VIEW_POLL_RESULTS &&
        viewResultPollId &&
        polls[viewResultPollId] && <PollResultModal />}
    </>
    //  TODO:SUP  <Suspense fallback={<div>Loading...</div>}>
    //    {activePollModal === PollAction.DraftPoll && <DraftPollModal />}
    //    {activePollModal === PollAction.RespondToPoll && <RespondToPollModal />}
    //    {activePollModal === PollAction.SharePollResult && <SharePollResultModal />}
    //  </Suspense>
  );
}
export default Poll;

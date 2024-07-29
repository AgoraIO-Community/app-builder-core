import React from 'react';
import {PollProvider, usePoll} from '../context';
import SelectNewPollTypeModal from '../modal/SelectNewPollTypeModal';
import CreatePollModal from '../modal/CreatePollModal';
import PollPreviewModal from '../modal/PollPreviewModal';
import SharePollModal from '../modal/SharePollModal';

function Poll() {
  return (
    <PollProvider>
      <PollModals />
    </PollProvider>
  );
}

function PollModals() {
  const {state} = usePoll();
  const {nextUserActivity} = state;

  const openSelectNewPollTypeModal = nextUserActivity === 'SELECT_NEW_POLL';
  const openCreatePollModal = nextUserActivity === 'CREATE_POLL';
  const openPreviewModal = nextUserActivity === 'PREVIEW_POLL';
  return (
    <>
      {openSelectNewPollTypeModal && (
        <SelectNewPollTypeModal visible={openSelectNewPollTypeModal} />
      )}
      {openCreatePollModal && <CreatePollModal visible={openCreatePollModal} />}
      {openPreviewModal && <PollPreviewModal visible={openPreviewModal} />}
      {/* <SharePollModal /> */}
    </>
  );
}

export default Poll;

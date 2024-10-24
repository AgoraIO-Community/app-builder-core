import React from 'react';
import {PollModalType, PollProvider, usePoll} from '../context/poll-context';
import PollFormWizardModal from './modals/PollFormWizardModal';
import {PollEventsProvider, PollEventsSubscriber} from '../context/poll-events';
import PollResponseFormModal from './modals/PollResponseFormModal';
import PollResultModal from './modals/PollResultModal';
import PollConfirmModal from './modals/PollEndConfirmModal';
import PollItemNotFound from './modals/PollItemNotFound';
import {log} from '../helpers';

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
  const {modalState, polls} = usePoll();
  // Log only in development mode to prevent performance hits
  if (process.env.NODE_ENV === 'development') {
    log('polls data changed: ', polls);
  }

  const renderModal = () => {
    switch (modalState.modalType) {
      case PollModalType.DRAFT_POLL:
        if (modalState.id && polls[modalState.id]) {
          const editFormObject = {...polls[modalState.id]};
          return <PollFormWizardModal formObject={editFormObject} />;
        }
        return <PollFormWizardModal />;
      case PollModalType.PREVIEW_POLL:
        if (modalState.id && polls[modalState.id]) {
          const previewFormObject = {...polls[modalState.id]};
          return (
            <PollFormWizardModal
              formObject={previewFormObject}
              formStep="PREVIEW"
            />
          );
        }
        break;
      case PollModalType.RESPOND_TO_POLL:
        if (modalState.id && polls[modalState.id]) {
          return <PollResponseFormModal pollId={modalState.id} />;
        }
        return <PollItemNotFound />;
      case PollModalType.VIEW_POLL_RESULTS:
        if (modalState.id && polls[modalState.id]) {
          return <PollResultModal pollId={modalState.id} />;
        }
        return <PollItemNotFound />;
      case PollModalType.END_POLL_CONFIRMATION:
        if (modalState.id && polls[modalState.id]) {
          return <PollConfirmModal actionType="end" pollId={modalState.id} />;
        }
        return <PollItemNotFound />;
      case PollModalType.DELETE_POLL_CONFIRMATION:
        if (modalState.id && polls[modalState.id]) {
          return (
            <PollConfirmModal actionType="delete" pollId={modalState.id} />
          );
        }
        return <PollItemNotFound />;
      case PollModalType.NONE:
        break;
      default:
        log('Unknown modal type: ', modalState);
        return <></>;
    }
  };

  return <>{renderModal()}</>;
}

export default Poll;

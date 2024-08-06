import React from 'react';
import {PollProvider} from '../context/poll-context';
import PollFormModal from './modals/PollFormModal';
import {PollEventsProvider} from '../context/poll-events';

function Poll({children}: {children?: React.ReactNode}) {
  return (
    <PollProvider>
      <PollEventsProvider>
        {children}
        <PollFormModal />
      </PollEventsProvider>
    </PollProvider>
  );
}

export default Poll;

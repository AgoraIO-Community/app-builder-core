import React, {useState, useEffect} from 'react';
import {View} from 'react-native';
import {PollCard} from './PollCard';
import {PollItem, PollStatus, usePoll} from '../context/poll-context';
import {
  BaseAccordion,
  BaseAccordionItem,
  BaseAccordionHeader,
  BaseAccordionContent,
} from '../ui/BaseAccordian';
import {useLocalUid} from 'customization-api';

type PollsGrouped = Array<{key: string; poll: PollItem}>;

export default function PollList() {
  const {polls} = usePoll();
  const localUid = useLocalUid();

  // State to keep track of the currently open accordion
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // Group polls by their status
  const groupedPolls = Object.entries(polls).reduce(
    (acc, [key, poll]) => {
      // Check if the poll should be included in the LATER group based on creator
      if (poll.status === PollStatus.LATER && poll.createdBy !== localUid) {
        return acc; // Skip this poll if it doesn't match the localUid
      }
      // Otherwise, add the poll to the corresponding group
      acc[poll.status].push({key, poll});
      return acc;
    },
    {
      [PollStatus.LATER]: [] as PollsGrouped,
      [PollStatus.ACTIVE]: [] as PollsGrouped,
      [PollStatus.FINISHED]: [] as PollsGrouped,
    },
  );

  // Destructure grouped polls for easy access
  const {
    LATER: draftPolls,
    ACTIVE: activePolls,
    FINISHED: finishedPolls,
  } = groupedPolls;

  // Set default open accordion based on priority: Active > Draft > Completed
  useEffect(() => {
    if (activePolls.length > 0) {
      setOpenAccordion('active-accordion');
    } else if (draftPolls.length > 0) {
      setOpenAccordion('draft-accordion');
    } else if (finishedPolls.length > 0) {
      setOpenAccordion('finished-accordion');
    }
  }, [activePolls, draftPolls, finishedPolls]);

  // Function to handle accordion toggling
  const handleAccordionToggle = (id: string) => {
    setOpenAccordion(prev => (prev === id ? null : id));
  };

  //  Render a section with its corresponding Accordion
  const renderPollList = (
    pollsGrouped: PollsGrouped,
    title: string,
    id: string,
  ) => {
    return pollsGrouped.length ? (
      <BaseAccordion>
        <BaseAccordionItem open={openAccordion === id}>
          <BaseAccordionHeader
            title={`${title} (${pollsGrouped.length})`}
            id={id}
            onPress={() => handleAccordionToggle(id)}
          />
          <BaseAccordionContent>
            {pollsGrouped.map(({key, poll}) => (
              <PollCard key={key} pollItem={poll} />
            ))}
          </BaseAccordionContent>
        </BaseAccordionItem>
      </BaseAccordion>
    ) : null;
  };

  return (
    <View>
      {renderPollList(activePolls, 'Active', 'active-accordion')}
      {renderPollList(draftPolls, 'Saved as Draft', 'draft-accordion')}
      {renderPollList(finishedPolls, 'Completed', 'finished-accordion')}
    </View>
  );
}

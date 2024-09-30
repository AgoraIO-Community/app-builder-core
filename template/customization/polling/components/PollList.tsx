import React from 'react';
import {View} from 'react-native';
import {PollCard} from './PollCard';
import {usePoll} from '../context/poll-context';
import {
  BaseAccordion,
  BaseAccordionItem,
  BaseAccordionHeader,
  BaseAccordionContent,
} from '../ui/BaseAccordian';

export default function PollList() {
  const {polls, isHost} = usePoll();
  console.log('supriya polls: ', polls);

  return (
    <View>
      <BaseAccordion>
        <BaseAccordionItem>
          <BaseAccordionHeader title="Active (1)" id="active-accordian" />
          <BaseAccordionContent>
            {Object.keys(polls).map((key: string) => (
              <PollCard key={key} isHost={isHost} pollItem={polls[key]} />
            ))}
          </BaseAccordionContent>
        </BaseAccordionItem>
      </BaseAccordion>
    </View>
  );
}

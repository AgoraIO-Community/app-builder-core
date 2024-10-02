import React, {useState} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {
  BaseModal,
  BaseModalCloseIcon,
  BaseModalContent,
  BaseModalTitle,
} from '../../ui/BaseModal';
import {
  PollResponseFormComplete,
  PollRenderResponseFormBody,
} from '../form/poll-response-forms';
import {PollTaskRequestTypes, usePoll} from '../../context/poll-context';
import {getPollTypeDesc, hasUserVoted} from '../../helpers';
import {ThemeConfig, $config, useLocalUid} from 'customization-api';

export default function PollResponseFormModal() {
  const {
    polls,
    launchPollId,
    sendResponseToPoll,
    closeCurrentModal,
    handlePollTaskRequest,
  } = usePoll();
  const [hasResponded, setHasResponded] = useState<boolean>(false);
  const localUid = useLocalUid();

  const onFormComplete = (responses: string | string[]) => {
    sendResponseToPoll(pollItem, responses);
    if (pollItem.share_attendee || pollItem.share_host) {
      handlePollTaskRequest(PollTaskRequestTypes.VIEW_DETAILS, pollItem.id);
    } else {
      setHasResponded(true);
    }
  };

  // Check if launchPollId is valid and if the poll exists in the polls object
  const pollItem = launchPollId ? polls[launchPollId] : null;

  if (!pollItem) {
    return (
      <BaseModal visible={true} onClose={closeCurrentModal}>
        <BaseModalTitle>
          <p>No poll available</p>
          <BaseModalCloseIcon onClose={closeCurrentModal} />
        </BaseModalTitle>
        <BaseModalContent>
          <p>Poll data is not available or invalid.</p>
        </BaseModalContent>
      </BaseModal>
    );
  }
  return (
    <BaseModal visible={true} onClose={closeCurrentModal}>
      <BaseModalTitle
        title={
          hasResponded
            ? 'Here are the poll results 🎉'
            : 'Here’s a poll for you'
        }>
        <BaseModalCloseIcon onClose={closeCurrentModal} />
      </BaseModalTitle>
      <BaseModalContent>
        {hasResponded ? (
          <PollResponseFormComplete />
        ) : (
          <>
            <View>
              <Text style={style.info}>{getPollTypeDesc(pollItem.type)}</Text>
              <Text style={style.heading}>{pollItem.question}</Text>
            </View>
            <PollRenderResponseFormBody
              hasUserResponded={hasUserVoted(pollItem.options, localUid)}
              pollItem={pollItem}
              onFormComplete={onFormComplete}
            />
          </>
        )}
      </BaseModalContent>
    </BaseModal>
  );
}
export const style = StyleSheet.create({
  heading: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.medium,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 24,
    fontWeight: '600',
  },
  info: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    lineHeight: 12,
  },
});

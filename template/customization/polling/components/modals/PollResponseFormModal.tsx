import React, {useState} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {
  BaseModal,
  BaseModalActions,
  BaseModalCloseIcon,
  BaseModalContent,
  BaseModalTitle,
} from '../../ui/BaseModal';
import {
  PollResponseFormComplete,
  PollRenderResponseFormBody,
  PollFormSubmitButton,
} from '../form/poll-response-forms';
import {PollTaskRequestTypes, usePoll} from '../../context/poll-context';
import {getPollTypeDesc} from '../../helpers';
import {ThemeConfig, $config, TertiaryButton} from 'customization-api';
import {usePollForm} from '../../hook/usePollForm';

export default function PollResponseFormModal() {
  const {
    polls,
    launchPollId,
    sendResponseToPoll,
    closeCurrentModal,
    handlePollTaskRequest,
  } = usePoll();

  const [hasResponded, setHasResponded] = useState<boolean>(false);

  const onFormSubmit = (responses: string | string[]) => {
    sendResponseToPoll(pollItem, responses);
  };

  const onFormSubmitComplete = () => {
    if (pollItem.share_attendee || pollItem.share_host) {
      handlePollTaskRequest(PollTaskRequestTypes.VIEW_DETAILS, pollItem.id);
    } else {
      setHasResponded(true);
    }
  };

  // Check if launchPollId is valid and if the poll exists in the polls object
  const pollItem = launchPollId ? polls[launchPollId] : null;

  const {
    onSubmit,
    selectedOption,
    handleRadioSelect,
    selectedOptions,
    handleCheckboxToggle,
    answer,
    setAnswer,
    buttonText,
    buttonStatus,
    submitDisabled,
  } = usePollForm({
    pollItem,
    initialSubmitted: false,
    onFormSubmit,
    onFormSubmitComplete,
  });

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
              selectedOption={selectedOption}
              selectedOptions={selectedOptions}
              handleCheckboxToggle={handleCheckboxToggle}
              handleRadioSelect={handleRadioSelect}
              setAnswer={setAnswer}
              answer={answer}
              pollItem={pollItem}
              submitted={buttonStatus === 'submitted'}
            />
          </>
        )}
      </BaseModalContent>
      <BaseModalActions alignRight>
        {hasResponded && (
          <View>
            <TertiaryButton
              containerStyle={style.btnContainer}
              text="Close"
              onPress={closeCurrentModal}
            />
          </View>
        )}
        <View>
          <PollFormSubmitButton
            buttonStatus={buttonStatus}
            onSubmit={onSubmit}
            submitDisabled={submitDisabled}
            buttonText={buttonText}
          />
        </View>
      </BaseModalActions>
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
  btnContainer: {
    minWidth: 150,
    height: 36,
    borderRadius: 4,
  },
  submittedBtn: {
    backgroundColor: $config.SEMANTIC_SUCCESS,
    cursor: 'default',
  },
  btnText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

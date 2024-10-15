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
import {
  PollStatus,
  PollTaskRequestTypes,
  usePoll,
} from '../../context/poll-context';
import {getPollTypeDesc} from '../../helpers';
import {
  ThemeConfig,
  $config,
  TertiaryButton,
  useSidePanel,
} from 'customization-api';
import {usePollForm} from '../../hook/usePollForm';
import {POLL_SIDEBAR_NAME} from '../../../custom-ui';

export default function PollResponseFormModal({pollId}: {pollId: string}) {
  const {polls, sendResponseToPoll, closeCurrentModal, handlePollTaskRequest} =
    usePoll();
  const {setSidePanel} = useSidePanel();
  const [hasResponded, setHasResponded] = useState<boolean>(false);

  const pollItem = polls[pollId];

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

  const onClose = () => {
    if (!hasResponded) {
      setSidePanel(POLL_SIDEBAR_NAME);
      closeCurrentModal();
    } else {
      closeCurrentModal();
    }
  };

  return (
    <BaseModal visible={true} onClose={onClose}>
      <BaseModalTitle
        title={
          hasResponded
            ? 'Here are the poll results 🎉'
            : 'Here’s a poll for you'
        }>
        <BaseModalCloseIcon onClose={onClose} />
      </BaseModalTitle>
      <BaseModalContent>
        {hasResponded ? (
          <PollResponseFormComplete />
        ) : (
          <>
            {pollItem.status === PollStatus.FINISHED && (
              <View>
                <Text style={style.warning}>
                  This poll has ended. You can no longer submit the response
                </Text>
              </View>
            )}
            <View style={style.header}>
              <Text style={style.info}>
                {getPollTypeDesc(pollItem.type, pollItem.multiple_response)}
              </Text>
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
              submitting={buttonStatus === 'submitting'}
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
            submitDisabled={
              submitDisabled || pollItem.status === PollStatus.FINISHED
            }
            buttonText={buttonText}
          />
        </View>
      </BaseModalActions>
    </BaseModal>
  );
}
export const style = StyleSheet.create({
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
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
  warning: {
    color: $config.SEMANTIC_ERROR,
    fontSize: ThemeConfig.FontSize.small,
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

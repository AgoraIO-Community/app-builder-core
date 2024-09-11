import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {
  PollItem,
  PollItemOptionItem,
  PollStatus,
  PollTaskRequestTypes,
  usePoll,
} from '../context/poll-context';
import {ThemeConfig, TertiaryButton, useLocalUid} from 'customization-api';
import {PollOptionList, PollOptionListItemResult} from './poll-option-item-ui';
import {BaseMoreButton} from '../ui/BaseMoreButton';
import {PollCardMoreActions} from './PollCardMoreActions';
import {capitalizeFirstLetter, hasUserVoted} from '../helpers';
import {PollRenderResponseFormBody} from './form/poll-response-forms';

function PollCard({pollItem, isHost}: {pollItem: PollItem; isHost: boolean}) {
  const {sendResponseToPoll, handlePollTaskRequest} = usePoll();
  const localUid = useLocalUid();

  const moreBtnRef = React.useRef<View>(null);
  const [actionMenuVisible, setActionMenuVisible] =
    React.useState<boolean>(false);

  const resultView =
    isHost ||
    pollItem.status === PollStatus.FINISHED ||
    hasUserVoted(pollItem.options, localUid);

  return (
    <View style={style.pollItem}>
      <View style={style.pollCard}>
        <View style={style.pollCardHeader}>
          <Text style={style.pollCardHeaderText}>
            {capitalizeFirstLetter(pollItem.status)}
          </Text>
          <View>
            {isHost ? (
              <>
                <BaseMoreButton
                  ref={moreBtnRef}
                  setActionMenuVisible={setActionMenuVisible}
                />
                <PollCardMoreActions
                  status={pollItem.status}
                  moreBtnRef={moreBtnRef}
                  actionMenuVisible={actionMenuVisible}
                  setActionMenuVisible={setActionMenuVisible}
                  onCardActionSelect={action => {
                    handlePollTaskRequest(action, pollItem.id);
                  }}
                />
              </>
            ) : (
              <></>
            )}
          </View>
        </View>
        <View style={style.pollCardContent}>
          <View style={style.fullWidth}>
            <Text style={style.pollCardContentQuestionText}>
              {pollItem.question}
            </Text>
          </View>
          <View style={style.fullWidth}>
            {resultView ? (
              <PollOptionList>
                {pollItem.options.map(
                  (item: PollItemOptionItem, index: number) => (
                    <PollOptionListItemResult
                      key={index}
                      optionItem={item}
                      showYourVote={!isHost}
                    />
                  ),
                )}
              </PollOptionList>
            ) : pollItem.status === PollStatus.ACTIVE ? (
              <View style={style.pollResponseFormView}>
                <PollRenderResponseFormBody
                  pollItem={pollItem}
                  onFormComplete={(responses: string | string[]) => {
                    sendResponseToPoll(pollItem, responses);
                  }}
                />
              </View>
            ) : (
              <Text>Form not published yet. Incorrect state</Text>
            )}
          </View>
        </View>
        <View style={style.pollCardFooter}>
          <View style={style.pollCardFooterActions}>
            {resultView ? (
              <TertiaryButton
                text="View Details"
                onPress={() =>
                  handlePollTaskRequest(
                    PollTaskRequestTypes.VIEW_DETAILS,
                    pollItem.id,
                  )
                }
              />
            ) : (
              <></>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
const style = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
  },
  pollItem: {
    marginVertical: 12,
  },
  pollCard: {
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignSelf: 'stretch',
    backgroundColor: $config.CARD_LAYER_3_COLOR,
    borderRadius: 15,
  },
  pollCardHeader: {
    height: 24,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pollCardHeaderText: {
    color: '#04D000',
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    lineHeight: 12,
  },
  pollCardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    alignSelf: 'stretch',
    alignItems: 'flex-start',
  },
  pollCardContentQuestionText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    lineHeight: 16,
  },
  pollCardFooter: {},
  pollCardFooterActions: {
    alignSelf: 'flex-start',
  },
  pollResponseFormView: {
    display: 'flex',
    gap: 20,
  },
});

export {PollCard};

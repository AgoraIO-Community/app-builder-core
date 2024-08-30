import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {
  PollItem,
  PollItemOptionItem,
  PollStatus,
  usePoll,
} from '../context/poll-context';
import {ThemeConfig, TertiaryButton} from 'customization-api';
import {PollOptionList, PollOptionListItemResult} from './poll-option-item-ui';
import {BaseMoreButton} from '../ui/BaseMoreButton';
import {PollCardMoreActions, PollTaskRequestTypes} from './PollCardMoreActions';
import {capitalizeFirstLetter} from '../helpers';
import {PollRenderResponseForm} from './form/poll-response-forms';

function PollCard({pollItem, isHost}: {pollItem: PollItem; isHost: boolean}) {
  const {sendResponseToPoll, handlePollTaskRequest} = usePoll();

  const moreBtnRef = React.useRef<View>(null);
  const [actionMenuVisible, setActionMenuVisible] =
    React.useState<boolean>(false);

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
            <PollOptionList>
              {pollItem.options.map((item: PollItemOptionItem, index: number) =>
                pollItem.status === PollStatus.FINISHED ? (
                  <PollOptionListItemResult
                    key={index}
                    optionItem={item}
                    showYourVote={!isHost}
                  />
                ) : pollItem.status === PollStatus.ACTIVE ? (
                  <PollRenderResponseForm
                    pollItem={pollItem}
                    onFormComplete={(responses: string | string[]) => {
                      sendResponseToPoll(pollItem, responses);
                    }}
                  />
                ) : (
                  <Text>Form not published yet. Incorrect state</Text>
                ),
              )}
            </PollOptionList>
          </View>
        </View>
        <View style={style.pollCardFooter}>
          <View style={style.pollCardFooterActions}>
            {pollItem.status === PollStatus.FINISHED ? (
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
});

export {PollCard};

import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import {
  PollItem,
  PollStatus,
  PollTaskRequestTypes,
  usePoll,
} from '../context/poll-context';
import {
  ThemeConfig,
  TertiaryButton,
  useLocalUid,
  $config,
  LinkButton,
  ImageIcon,
} from 'customization-api';
import {BaseMoreButton} from '../ui/BaseMoreButton';
import {PollCardMoreActions} from './PollCardMoreActions';
import {capitalizeFirstLetter, getPollTypeDesc, hasUserVoted} from '../helpers';
import {
  PollFormSubmitButton,
  PollRenderResponseFormBody,
} from './form/poll-response-forms';
import {usePollPermissions} from '../hook/usePollPermissions';
import {usePollForm} from '../hook/usePollForm';

const PollCardHeader = ({pollItem}: {pollItem: PollItem}) => {
  const moreBtnRef = React.useRef<View>(null);
  const [actionMenuVisible, setActionMenuVisible] =
    React.useState<boolean>(false);
  const {editPollForm, handlePollTaskRequest} = usePoll();
  const {canEdit} = usePollPermissions({pollItem});

  return (
    <View style={style.pollCardHeader}>
      <View style={[style.row, style.gap8]}>
        <Text style={style.pollCardHeaderText}>
          {getPollTypeDesc(pollItem.type)}
        </Text>
        {pollItem.status === PollStatus.LATER && (
          <>
            <View style={style.dot} />
            <Text style={style.pollCardHeaderText}>Draft</Text>
          </>
        )}
      </View>
      {canEdit && (
        <View style={style.row}>
          {pollItem.status === PollStatus.LATER && (
            <TouchableOpacity
              style={style.mr8}
              onPress={() => {
                editPollForm(pollItem.id);
              }}>
              <View style={[style.row, style.gap5]}>
                <ImageIcon
                  iconType="plain"
                  name="pen"
                  tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
                  iconSize={14}
                />
                <Text style={style.linkText}>Edit</Text>
              </View>
            </TouchableOpacity>
          )}
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
              setActionMenuVisible(false);
            }}
          />
        </View>
      )}
    </View>
  );
};

const PollCardContent = ({pollItem}: {pollItem: PollItem}) => {
  const {sendResponseToPoll} = usePoll();
  const {canViewPollDetails} = usePollPermissions({pollItem});
  const localUid = useLocalUid();
  const hasSubmittedResponse = hasUserVoted(pollItem.options, localUid);

  const onFormSubmit = (responses: string | string[]) => {
    sendResponseToPoll(pollItem, responses);
  };

  const onFormSubmitComplete = () => {
    //  console.log('supriya');
    // Declaring this method just to have buttonVisible working
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
    submitDisabled,
    buttonStatus,
    buttonVisible,
  } = usePollForm({
    pollItem,
    initialSubmitted: hasSubmittedResponse,
    onFormSubmit,
    onFormSubmitComplete,
  });

  return (
    <View style={style.pollCardContent}>
      <Text
        style={style.pollCardContentQuestionText}
        numberOfLines={pollItem.status === PollStatus.LATER ? 1 : undefined}
        ellipsizeMode="tail">
        {capitalizeFirstLetter(pollItem.question)}
      </Text>
      {pollItem.status === PollStatus.LATER ? (
        <></>
      ) : (
        <>
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
          {hasSubmittedResponse && !buttonVisible ? (
            <></>
          ) : (
            <View
              style={[canViewPollDetails ? style.fullWidth : style.alignRight]}>
              <PollFormSubmitButton
                buttonStatus={buttonStatus}
                onSubmit={onSubmit}
                submitDisabled={submitDisabled}
                buttonText={buttonText}
              />
            </View>
          )}
        </>
      )}
    </View>
  );
};

const PollCardFooter = ({pollItem}: {pollItem: PollItem}) => {
  const {handlePollTaskRequest} = usePoll();
  const {canEnd, canViewPollDetails} = usePollPermissions({pollItem});

  return (
    <View style={style.pollCardFooter}>
      {canEnd && (
        <View>
          <TertiaryButton text="End Poll" onPress={() => {}} />
        </View>
      )}
      {canViewPollDetails && (
        <View>
          <View style={style.linkBtnContainer}>
            <LinkButton
              text="View Details"
              textStyle={style.linkText}
              onPress={() =>
                handlePollTaskRequest(
                  PollTaskRequestTypes.VIEW_DETAILS,
                  pollItem.id,
                )
              }
            />
          </View>
        </View>
      )}
    </View>
  );
};

function PollCard({pollItem}: {pollItem: PollItem}) {
  return (
    <View style={style.pollItem}>
      <View style={style.pollCard}>
        <PollCardHeader pollItem={pollItem} />
        <PollCardContent pollItem={pollItem} />
        {pollItem.status !== PollStatus.LATER && (
          <>
            <PollCardFooter pollItem={pollItem} />
          </>
        )}
      </View>
    </View>
  );
}
export {PollCard};

const style = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
  },
  pollItem: {
    marginVertical: 12,
  },
  pollCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: $config.CARD_LAYER_3_COLOR,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  pollCardHeader: {
    height: 24,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pollCardHeaderText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
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
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '700',
    lineHeight: 19,
  },
  pollCardFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  linkBtnContainer: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    textAlign: 'center',
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    lineHeight: 16,
  },
  space: {
    marginHorizontal: 8,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gap8: {
    gap: 8,
  },
  gap5: {
    gap: 5,
  },
  mr8: {
    marginRight: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#7D7D7D', // TODOSUP
  },
  alignRight: {
    alignSelf: 'flex-end',
  },
});

import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
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
} from 'customization-api';
import {BaseMoreButton} from '../ui/BaseMoreButton';
import {PollCardMoreActions} from './PollCardMoreActions';
import {getPollTypeDesc, hasUserVoted} from '../helpers';
import {PollRenderResponseFormBody} from './form/poll-response-forms';
import {usePollPermissions} from '../hook/usePollPermissions';

const PollCardHeader = ({pollItem}: {pollItem: PollItem}) => {
  const moreBtnRef = React.useRef<View>(null);
  const [actionMenuVisible, setActionMenuVisible] =
    React.useState<boolean>(false);
  const {handlePollTaskRequest} = usePoll();
  const {canEdit} = usePollPermissions({pollItem});

  return (
    <View style={style.pollCardHeader}>
      <View style={style.row}>
        <Text style={style.pollCardHeaderText}>
          {getPollTypeDesc(pollItem.type)}
        </Text>
        {pollItem.status === PollStatus.LATER && (
          <>
            <View style={style.space} />
            <Text style={style.pollCardHeaderText}>Draft</Text>
          </>
        )}
      </View>
      <View style={style.row}>
        {canEdit ? (
          <>
            {pollItem.status === PollStatus.LATER && (
              <LinkButton
                text="Edit"
                textStyle={style.linkText}
                onPress={() => {}}
              />
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
          </>
        ) : (
          <></>
        )}
      </View>
    </View>
  );
};

const PollCardContent = ({pollItem}: {pollItem: PollItem}) => {
  const {sendResponseToPoll} = usePoll();
  const localUid = useLocalUid();

  return (
    <View style={style.pollCardContent}>
      <Text
        style={style.pollCardContentQuestionText}
        numberOfLines={pollItem.status === PollStatus.LATER ? 1 : undefined}
        ellipsizeMode="tail">
        {pollItem.question}
      </Text>
      {pollItem.status !== PollStatus.LATER ? (
        <PollRenderResponseFormBody
          hasUserResponded={hasUserVoted(pollItem.options, localUid)}
          pollItem={pollItem}
          onFormComplete={(responses: string | string[]) => {
            sendResponseToPoll(pollItem, responses);
          }}
        />
      ) : (
        <></>
      )}
    </View>
  );
};

const PollCardFooter = ({pollItem}: {pollItem: PollItem}) => {
  const {handlePollTaskRequest} = usePoll();
  const {canEnd} = usePollPermissions({pollItem});

  return (
    <View style={style.pollCardFooter}>
      {canEnd && (
        <View>
          <TertiaryButton text="End Poll" onPress={() => {}} />
        </View>
      )}
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
  },
});

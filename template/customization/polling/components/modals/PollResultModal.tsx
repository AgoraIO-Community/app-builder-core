import {Text, StyleSheet, View} from 'react-native';
import React from 'react';
import {
  BaseModal,
  BaseModalTitle,
  BaseModalContent,
  BaseModalCloseIcon,
  BaseModalActions,
} from '../../ui/BaseModal';
import {
  ThemeConfig,
  $config,
  UserAvatar,
  TertiaryButton,
  useContent,
  useLocalUid,
} from 'customization-api';
import {
  PollItemOptionItem,
  PollTaskRequestTypes,
  usePoll,
} from '../../context/poll-context';
import {
  formatTimestampToTime,
  calculateTotalVotes,
  getPollTypeDesc,
  capitalizeFirstLetter,
} from '../../helpers';
import {usePollPermissions} from '../../hook/usePollPermissions';

export default function PollResultModal() {
  const {polls, viewResultPollId, closeCurrentModal, handlePollTaskRequest} =
    usePoll();
  const localUid = useLocalUid();
  const {defaultContent} = useContent();

  // Check if viewResultPollId is valid and if the poll exists in the polls object
  const pollItem = viewResultPollId ? polls[viewResultPollId] : null;

  const {canViewWhoVoted} = usePollPermissions({pollItem});

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
      <BaseModalTitle title="Poll Results">
        <BaseModalCloseIcon onClose={closeCurrentModal} />
      </BaseModalTitle>
      <BaseModalContent noPadding>
        <View style={style.resultContainer}>
          <View style={style.resultInfoContainer}>
            <View style={style.rowSpaceBetween}>
              <Text style={style.questionText}>
                {capitalizeFirstLetter(pollItem.question)}
              </Text>
              <Text style={style.totalText}>
                Total Responses {calculateTotalVotes(pollItem.options)}
              </Text>
            </View>
            <View style={style.row}>
              <Text style={style.descriptionText}>
                Created{' '}
                <Text style={style.bold}>
                  {formatTimestampToTime(pollItem.createdAt)}{' '}
                </Text>
                by{' '}
                <Text style={style.youText}>
                  {localUid === pollItem.createdBy
                    ? 'You'
                    : defaultContent[pollItem.createdBy]?.name || 'user'}
                </Text>
              </Text>
              <View style={style.dot} />
              <Text style={style.descriptionText}>
                {getPollTypeDesc(pollItem.type)}
              </Text>
            </View>
          </View>
          <View style={style.resultSummaryContainer}>
            {pollItem.options?.map((option: PollItemOptionItem, index) => (
              <View style={style.summaryCard} key={index}>
                <View style={style.summaryCardHeader}>
                  <View>
                    <Text style={[style.smallText, style.light, style.bold]}>
                      {`Option ${index + 1}`}
                    </Text>
                    <Text style={[style.smallText, style.bold]}>
                      {option.text}
                    </Text>
                  </View>
                  <View style={style.row}>
                    <Text
                      style={[style.smallText, style.light, style.alignRight]}>
                      {option.percent}%
                    </Text>
                    <View style={style.dot} />
                    <Text style={[style.smallText, style.bold]}>
                      {option.votes.length} votes
                    </Text>
                  </View>
                </View>
                {canViewWhoVoted && (
                  <View style={style.summaryCardBody}>
                    {option.votes.map((item, i) => (
                      <View style={style.summaryItem} key={i}>
                        <View style={style.titleAvatar}>
                          <UserAvatar
                            name={defaultContent[item.uid]?.name || 'user'}
                            containerStyle={style.titleAvatarContainer}
                            textStyle={style.titleAvatarContainerText}
                          />
                          <Text style={style.username}>
                            {defaultContent[item.uid]?.name || 'user'}
                          </Text>
                        </View>
                        <View>
                          <Text style={[style.smallText, style.light]}>
                            Voted {formatTimestampToTime(item.timestamp)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </BaseModalContent>
      <BaseModalActions alignRight>
        <View>
          <TertiaryButton
            containerStyle={style.btnContainer}
            text="Close"
            onPress={closeCurrentModal}
          />
        </View>
        <View>
          <TertiaryButton
            containerStyle={style.btnContainer}
            text="Export Results"
            onPress={() => {
              handlePollTaskRequest(PollTaskRequestTypes.EXPORT, pollItem.id);
            }}
          />
        </View>
      </BaseModalActions>
    </BaseModal>
  );
}

export const style = StyleSheet.create({
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    backgroundColor: $config.BACKGROUND_COLOR,
  },
  resultInfoContainer: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minHeight: 68,
  },
  rowSpaceBetween: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultSummaryContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  summaryCard: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
  },
  summaryCardHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  summaryCardBody: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleAvatar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  titleAvatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BDCFDB', // TODOSUP
  },
  titleAvatarContainerText: {
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 12,
    fontWeight: '600',
    color: $config.BACKGROUND_COLOR,
  },

  questionText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.medium,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 24,
    fontWeight: '600',
  },
  totalText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 20,
    fontWeight: '400',
  },
  descriptionText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  bold: {
    fontWeight: '600',
  },
  youText: {
    color: '#BDCFDB', // TODO
  },
  light: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
  },
  smallText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.tiny,
    fontWeight: '400',
    lineHeight: 16,
  },
  username: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '400',
    lineHeight: 20,
  },
  alignRight: {
    textAlign: 'right',
  },
  btnContainer: {
    minWidth: 150,
    height: 36,
    borderRadius: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#7D7D7D', // TODOSUP
  },
});

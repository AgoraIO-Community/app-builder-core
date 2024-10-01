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
} from 'customization-api';
import {
  PollItemOptionItem,
  PollTaskRequestTypes,
  usePoll,
} from '../../context/poll-context';
import {getCreatedTime} from '../../helpers';

export default function PollResultModal() {
  const {polls, viewResultPollId, closeCurrentModal, handlePollTaskRequest} =
    usePoll();
  const {defaultContent} = useContent();

  // Check if viewResultPollId is valid and if the poll exists in the polls object
  const pollItem = viewResultPollId ? polls[viewResultPollId] : null;

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
              <Text style={style.questionText}>{pollItem.question}</Text>
              <Text style={style.totalText}>Total Responses (6)</Text>
            </View>
            <View style={style.row}>
              <Text style={style.descriptionText}>
                Created <Text style={style.bold}>9:48 AM</Text> by
                <Text style={style.youText}> You </Text>
              </Text>
              <Text style={style.descriptionText}>Icon MCQ. Single Choice</Text>
            </View>
          </View>
          <View style={style.resultSummaryContainer}>
            {pollItem.options?.map((option: PollItemOptionItem, index) => (
              <View style={style.summaryCard}>
                <View style={style.summaryCardHeader}>
                  <View>
                    <Text style={[style.smallText, style.light, style.bold]}>
                      {`Option ${index + 1}`}
                    </Text>
                    <Text style={[style.smallText, style.bold]}>
                      {option.text}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={[style.smallText, style.light, style.alignRight]}>
                      {option.percent}
                    </Text>
                    <Text style={[style.smallText, style.bold]}>
                      {option.votes.length} votes
                    </Text>
                  </View>
                </View>
                <View style={style.summaryCardBody}>
                  {option.votes.map((item, i) => (
                    <View style={style.summaryItem} key={i}>
                      <View style={style.titleAvatar}>
                        <UserAvatar
                          name={defaultContent[item.uid] || 'user'}
                          containerStyle={style.titleAvatarContainer}
                          textStyle={style.titleAvatarContainerText}
                        />
                        <Text style={style.username}>
                          {defaultContent[item.uid] || 'user'}
                        </Text>
                      </View>
                      <View>
                        <Text style={[style.smallText, style.light]}>
                          Voted {getCreatedTime(item.timestamp)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
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
});

import {Text, StyleSheet, View} from 'react-native';
import React from 'react';
import {BaseModal, BaseModalTitle, BaseModalContent} from '../../ui/BaseModal';
import {ThemeConfig} from 'customization-api';
import PollAvatarHeader from '../PollAvatarHeader';
import {PollItemOptionItem, usePoll} from '../../context/poll-context';
import {PollOptionList, PollOptionListItemResult} from '../poll-option-item-ui';

export default function SharePollModal() {
  const {polls, sharePollId, isHost} = usePoll();

  const pollItem = polls['123'];

  return (
    <BaseModal visible={true}>
      <BaseModalTitle>
        <PollAvatarHeader pollItem={pollItem} />
      </BaseModalTitle>
      <BaseModalContent>
        <View style={style.shareBox}>
          <Text style={style.questionText}>{pollItem.question}</Text>
          <View style={style.responseSection}>
            <PollOptionList>
              {pollItem.options.map((item: PollItemOptionItem) => (
                <PollOptionListItemResult
                  optionItem={item}
                  showYourVote={!isHost()}
                />
              ))}
            </PollOptionList>
          </View>
        </View>
      </BaseModalContent>
    </BaseModal>
  );
}

export const style = StyleSheet.create({
  shareBox: {
    width: 550,
  },
  titleCard: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  titleAvatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
  },
  titleAvatarContainerText: {
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    fontWeight: '600',
    color: $config.VIDEO_AUDIO_TILE_COLOR,
  },
  titleText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '700',
    lineHeight: 20,
  },
  titleSubtext: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.tiny,
    fontWeight: '400',
    lineHeight: 16,
  },
  questionText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.medium,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 24,
    fontWeight: '600',
  },
  responseSection: {
    marginVertical: 20,
  },
});

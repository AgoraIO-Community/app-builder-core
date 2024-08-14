import {Text, StyleSheet, View} from 'react-native';
import React from 'react';
import {BaseModal, BaseModalTitle, BaseModalContent} from '../../ui/BaseModal';
import {ThemeConfig} from 'customization-api';
import {PollItem} from '../../context/poll-context';
import PollAvatarHeader from '../PollAvatarHeader';

export default function SharePollModal({pollItem}: {pollItem: PollItem}) {
  return (
    <BaseModal visible={true}>
      <BaseModalTitle>
        <PollAvatarHeader pollItem={pollItem} />
      </BaseModalTitle>
      <BaseModalContent>
        <View style={style.shareBox}>
          <Text style={style.questionText}>{pollItem.question}</Text>
          <View style={style.responseSection}>
            <View style={style.responseCard}>
              <View style={style.responseCardBody}>
                <Text style={style.responseText}>Great</Text>
                <Text style={style.yourResponseText}>Your Response</Text>
                <Text style={[style.responseText, style.pushRight]}>
                  75% (15)
                </Text>
              </View>
              <View style={style.progressBar}>
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    style.progressBarFill,
                    {
                      width: '50%',
                    },
                  ]}
                />
              </View>
            </View>
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
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 9,
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginVertical: 20,
  },
  responseCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  responseCardBody: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  responseText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    lineHeight: 24,
  },
  yourResponseText: {
    color: $config.SEMANTIC_SUCCESS,
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    lineHeight: 12,
    paddingLeft: 16,
  },
  pushRight: {
    marginLeft: 'auto',
  },
  progressBar: {
    height: 4,
    borderRadius: 8,
    backgroundColor: $config.CARD_LAYER_3_COLOR,
    width: '100%',
  },
  progressBarFill: {
    borderRadius: 8,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
});

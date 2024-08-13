import {Text, StyleSheet, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {BaseModalTitle, BaseModalContent} from '../../ui/BaseModal';
import ThemeConfig from '../../../../theme';
import {PollKind} from '../../context/poll-context';

interface newPollType {
  key: PollKind;
  image: null;
  title: string;
  description: string;
}

const newPollTypeConfig: newPollType[] = [
  {
    key: PollKind.MCQ,
    image: null,
    title: 'Multiple Choice',
    description: 'Quick stand-alone question with different options',
  },
  {
    key: PollKind.OPEN_ENDED,
    image: null,
    title: 'Open Ended',
    description: 'Question with a descriptive, open text response',
  },
  {
    key: PollKind.YES_NO,
    image: null,
    title: 'Yes / No',
    description: 'A simple question with a binary Yes or No response',
  },
];

export default function SelectNewPollTypeFormView({
  setType,
}: {
  setType: React.Dispatch<React.SetStateAction<PollKind>>;
}) {
  return (
    <>
      <BaseModalTitle title="New Poll" />
      <BaseModalContent>
        <View style={style.section}>
          {newPollTypeConfig.map((item: newPollType) => (
            <TouchableOpacity
              importantForAccessibility="no"
              accessibilityRole="button"
              key={item.key}
              onPress={() => {
                setType(item.key);
              }}>
              <View style={style.card}>
                <View style={style.cardImage} />
                <View style={style.cardContent}>
                  <Text style={style.cardContentTitle}>{item.title}</Text>
                  <Text style={style.cardContentDesc}>{item.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </BaseModalContent>
    </>
  );
}

export const style = StyleSheet.create({
  section: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'space-between',
  },
  card: {
    flexDirection: 'column',
    gap: 12,
    width: 140,
    outlineStyle: 'none',
  },
  cardImage: {
    height: 90,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    backgroundColor: $config.CARD_LAYER_4_COLOR,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  cardContentTitle: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
    fontWeight: '400',
  },
  cardContentDesc: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
    fontWeight: '400',
  },
});

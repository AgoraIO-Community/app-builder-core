import {Text, StyleSheet, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {
  BaseModalTitle,
  BaseModalContent,
  BaseModalCloseIcon,
} from '../../ui/BaseModal';
import {PollKind} from '../../context/poll-context';
import {ThemeConfig, $config} from 'customization-api';
import PlatformWrapper from '../../../../src/utils/PlatformWrapper';

interface newPollType {
  key: PollKind;
  image: null;
  title: string;
  description: string;
}

const newPollTypeConfig: newPollType[] = [
  {
    key: PollKind.YES_NO,
    image: null,
    title: 'Yes or No Question',
    description:
      'A straightforward question that requires a simple Yes or No answer.',
  },
  {
    key: PollKind.MCQ,
    image: null,
    title: 'Multiple Choice Question',
    description:
      'A question with several predefined answer options, allowing users to select one or more responses.',
  },
  // {
  //   key: PollKind.OPEN_ENDED,
  //   image: null,
  //   title: 'Open Ended Question',
  //   description:
  //     'A question that invites users to provide a detailed, free-form response, encouraging more in-depth feedback.',
  // },
];

export default function SelectNewPollTypeFormView({
  setType,
  onClose,
}: {
  setType: React.Dispatch<React.SetStateAction<PollKind>>;
  onClose: () => void;
}) {
  return (
    <>
      <BaseModalTitle title="Create Poll">
        <BaseModalCloseIcon onClose={onClose} />
      </BaseModalTitle>
      <BaseModalContent>
        <View style={style.section}>
          <View>
            <Text style={style.sectionHeader}>
              What type of question would you like to ask?
            </Text>
          </View>
          <View style={style.pollTypeList}>
            {newPollTypeConfig.map((item: newPollType) => (
              <PlatformWrapper key={item.key}>
                {(isHovered: boolean) => {
                  return (
                    <TouchableOpacity
                      importantForAccessibility="no"
                      accessibilityRole="button"
                      onPress={() => {
                        setType(item.key);
                      }}
                      style={[style.card, isHovered ? style.cardHover : {}]}>
                      <View style={style.cardImage} />
                      <View style={style.cardContent}>
                        <Text
                          style={style.cardContentTitle}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          {item.title}
                        </Text>
                        <Text style={style.cardContentDesc} numberOfLines={0}>
                          {item.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              </PlatformWrapper>
            ))}
          </View>
        </View>
      </BaseModalContent>
    </>
  );
}

export const style = StyleSheet.create({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  sectionHeader: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 20,
    fontWeight: '400',
  },
  pollTypeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    padding: 12,
    flexDirection: 'row',
    gap: 20,
    outlineStyle: 'none',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    borderRadius: 8,
    width: '100%',
  },
  cardHover: {
    backgroundColor: 'rgba(128, 128, 128, 0.10)',
  },
  cardImage: {
    width: 100,
    height: 60,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: $config.CARD_LAYER_3_COLOR,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flexShrink: 1,
  },
  cardContentTitle: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
    fontWeight: '700',
  },
  cardContentDesc: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
    fontWeight: '400',
  },
});

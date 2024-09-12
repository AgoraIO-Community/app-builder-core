import React from 'react';
import {Text, View, StyleSheet, DimensionValue} from 'react-native';
import {PollItemOptionItem} from '../context/poll-context';
import {ThemeConfig, useLocalUid, $config} from 'customization-api';

interface PollOptionListItem {
  optionItem: PollItemOptionItem;
  showYourVote?: boolean;
}

function PollOptionList({children}: {children: React.ReactNode}) {
  return <View style={style.optionsList}>{children}</View>;
}

function PollOptionListItemResult({
  optionItem,
  showYourVote,
}: PollOptionListItem) {
  const localUid = useLocalUid();
  return (
    <View style={style.optionListItem}>
      <View style={style.optionListItemHeader}>
        <Text style={style.optionText}>{optionItem.text}</Text>
        {showYourVote &&
          optionItem.votes.some(item => item.uid === localUid) && (
            <Text style={style.yourResponseText}>Your Response</Text>
          )}
        <Text style={[style.optionText, style.pushRight]}>
          {optionItem.percent}% ({optionItem.votes.length})
        </Text>
      </View>
      <View style={style.optionListItemFooter}>
        <View style={style.progressBar}>
          <View
            key={optionItem.percent}
            style={[
              StyleSheet.absoluteFill,
              style.progressBarFill,
              {
                width: `${optionItem.percent}%` as DimensionValue,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  optionsList: {
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 9,
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  optionListItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  optionListItemHeader: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  optionListItemFooter: {},
  optionText: {
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

export {PollOptionList, PollOptionListItemResult};

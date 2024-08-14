import React from 'react';
import {Text, View, StyleSheet, DimensionValue} from 'react-native';
import {PollItem, PollItemOptionItem} from '../context/poll-context';
import {ThemeConfig, TertiaryButton, useLocalUid} from 'customization-api';

interface PollListItemWithResultProps {
  optionItem: PollItemOptionItem;
  showYourVote?: boolean;
}

function PollListItemWithResult({
  optionItem,
  showYourVote = false,
}: PollListItemWithResultProps) {
  const localUid = useLocalUid();
  return (
    <View style={style.optionListItem}>
      <View style={style.optionListItemHeader}>
        <Text style={style.optionText}>{optionItem.text}</Text>
        {showYourVote &&
          optionItem.votes.find(item => item.uid === localUid) && (
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

function PollListItemWithInput({optionItem}: PollListItemWithResultProps) {
  // Later
}
// {pollItem}: {pollItem: PollItem}
function PollCard({pollItem, isHost}: {pollItem: PollItem; isHost: boolean}) {
  return (
    <View style={style.pollItem}>
      <View style={style.pollCard}>
        <View style={style.pollCardHeader}>
          <Text style={style.pollCardHeaderText}>
            {pollItem.status.toLowerCase()}
          </Text>
          <View>
            {isHost ? (
              <Text style={style.pollCardHeaderText}>More</Text>
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
            <View style={[style.optionsList, style.extraBottomPadding]}>
              {pollItem.options.map((item: PollItemOptionItem) => (
                <PollListItemWithResult
                  optionItem={item}
                  showYourVote={!isHost}
                />
              ))}
            </View>
          </View>
        </View>
        <View style={style.pollCardFooter}>
          <View style={style.pollCardFooterActions}>
            <TertiaryButton
              text="View Details"
              onPress={() => {
                // show poll share modal
              }}
            />
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
  optionsList: {
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginVertical: 12,
  },
  extraBottomPadding: {
    paddingBottom: 32,
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

export {PollCard};

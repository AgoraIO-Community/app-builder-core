import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {PollItem, PollItemOptionItem} from '../context/poll-context';
import {ThemeConfig, TertiaryButton} from 'customization-api';
import {PollOptionList, PollOptionListItemResult} from './poll-option-item-ui';

function PollCard({
  pollItem,
  isHost,
  onPublish,
  onViewDetails,
}: {
  pollItem: PollItem;
  isHost: boolean;
  onPublish: (item: PollItem) => void;
  onViewDetails: (id: string) => void;
}) {
  return (
    <View style={style.pollItem}>
      <View style={style.pollCard}>
        <View style={style.pollCardHeader}>
          <Text style={style.pollCardHeaderText}>
            {pollItem.status.toLowerCase()}
          </Text>
          <View>
            {isHost ? (
              <Text
                onPress={() => onPublish(pollItem)}
                style={style.pollCardHeaderText}>
                Publish
              </Text>
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
            <PollOptionList>
              {pollItem.options.map((item: PollItemOptionItem) => (
                <PollOptionListItemResult
                  optionItem={item}
                  showYourVote={!isHost}
                />
              ))}
            </PollOptionList>
          </View>
        </View>
        <View style={style.pollCardFooter}>
          <View style={style.pollCardFooterActions}>
            <TertiaryButton
              text="View Details"
              onPress={() => onViewDetails(pollItem.id)}
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
});

export {PollCard};

import React from 'react';
import {Text, View, StyleSheet, DimensionValue} from 'react-native';
import {PollItemOptionItem} from '../context/poll-context';
import {ThemeConfig, $config, hexadecimalTransparency} from 'customization-api';

interface PollOptionListItem {
  optionItem: PollItemOptionItem;
  iVoted: boolean;
  canViewWhoVoted: boolean;
}

function PollOptionList({children}: {children: React.ReactNode}) {
  return <View style={style.optionsList}>{children}</View>;
}

function PollItemFill({canViewWhoVoted, iVoted, percent}) {
  return (
    <View
      style={[
        style.optionFillBackground,
        canViewWhoVoted
          ? iVoted
            ? {
                width: `${percent}%` as DimensionValue,
                backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
              }
            : {
                width: `${percent}%` as DimensionValue,
                backgroundColor:
                  $config.PRIMARY_ACTION_BRAND_COLOR +
                  hexadecimalTransparency['10%'],
              }
          : {},
      ]}
    />
  );
}
function PollOptionListItemResult({
  iVoted,
  canViewWhoVoted,
  optionItem,
}: PollOptionListItem) {
  return (
    <View style={[style.optionListItem]}>
      {/* Background fill according to vote percentage */}
      <PollItemFill
        canViewWhoVoted={canViewWhoVoted}
        iVoted={iVoted}
        percent={optionItem.percent}
      />
      <Text
        style={[
          style.optionText,
          !canViewWhoVoted && iVoted ? style.myVote : {},
        ]}>
        {optionItem.text}
      </Text>
      {canViewWhoVoted && (
        <Text style={[style.optionText, style.pushRight]}>
          {optionItem.percent}%
        </Text>
      )}
    </View>
  );
}

interface PollOptionInputListItem {
  index: number;
  checked: boolean;
  hovered: boolean;
  children: React.ReactChild;
}

function PollOptionInputListItem({
  index,
  checked,
  hovered,
  children,
}: PollOptionInputListItem) {
  return (
    <View
      style={[
        style.optionListItem,
        style.optionListItemInput,
        checked ? style.optionListItemChecked : {},
        !checked && hovered ? style.optionListItemHovered : {},
      ]}
      key={index}>
      {children}
    </View>
  );
}

const style = StyleSheet.create({
  optionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
  },
  optionListItem: {
    display: 'flex',
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
  },
  optionListItemInput: {
    backgroundColor: $config.CARD_LAYER_3_COLOR,
    padding: 0,
  },
  optionListItemChecked: {
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  optionListItemHovered: {
    borderColor: 'rgba(128, 128, 128, 0.25)',
  },
  optionFillBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  optionText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '700',
    lineHeight: 24,
  },
  myVote: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  pushRight: {
    marginLeft: 'auto',
  },
});

export {
  PollOptionList,
  PollOptionListItemResult,
  PollOptionInputListItem,
  PollItemFill,
};

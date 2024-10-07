import React from 'react';
import {Text, View, StyleSheet, DimensionValue} from 'react-native';
import {ThemeConfig, $config, hexadecimalTransparency} from 'customization-api';

function PollOptionList({children}: {children: React.ReactNode}) {
  return <View style={style.optionsList}>{children}</View>;
}

interface Props {
  submitting: boolean;
  submittedMyVote: boolean;
  percent: string;
}
function PollItemFill({submitting, submittedMyVote, percent}: Props) {
  return (
    <>
      <View
        style={[
          style.optionFillBackground,
          {
            // Determine the width and background color based on canViewWhoVoted and iVoted
            width: `${percent}%` as DimensionValue, // Always set the width based on the percentage value
            backgroundColor: submittedMyVote
              ? $config.PRIMARY_ACTION_BRAND_COLOR // If the user voted, use the primary brand color
              : !submitting
              ? $config.PRIMARY_ACTION_BRAND_COLOR +
                hexadecimalTransparency['10%'] // If not, use the brand color with reduced opacity
              : '',
          },
        ]}
      />
      <View style={[style.optionFillText]}>
        <Text style={[style.optionText]}>{`${percent}%`}</Text>
      </View>
    </>
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

const OPTION_LIST_ITEM_PADDING = 12;

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
    padding: OPTION_LIST_ITEM_PADDING,
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
  optionFillText: {
    position: 'absolute',
    top: OPTION_LIST_ITEM_PADDING,
    bottom: 0,
    right: OPTION_LIST_ITEM_PADDING,
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

export {PollOptionList, PollOptionInputListItem, PollItemFill};

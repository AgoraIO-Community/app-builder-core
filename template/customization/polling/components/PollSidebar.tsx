import React from 'react';
import {View, StyleSheet, ScrollView, Text} from 'react-native';
import {
  PrimaryButton,
  ThemeConfig,
  $config,
  ImageIcon,
} from 'customization-api';
import {usePoll} from '../context/poll-context';
import PollList from './PollList';
import pollIcons from '../poll-icons';

const PollSidebar = () => {
  const {startPollForm, isHost, polls} = usePoll();

  return (
    <View style={style.pollSidebar}>
      {Object.keys(polls).length === 0 ? (
        <View style={style.emptyView}>
          <View style={style.emptyCard}>
            {isHost && (
              <View style={style.emptyCardIcon}>
                <ImageIcon
                  iconType="plain"
                  tintColor={$config.CARD_LAYER_1_COLOR}
                  iconSize={32}
                  icon={pollIcons['bar-chart']}
                />
              </View>
            )}
            <Text style={style.emptyText}>
              {isHost
                ? 'Create a new poll and boost interaction with your audience.'
                : 'No polls here yet...'}
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={style.scrollViewContent}>
          <PollList />
        </ScrollView>
      )}
      {isHost ? (
        <View style={style.pollFooter}>
          <PrimaryButton
            containerStyle={style.btnContainer}
            textStyle={style.btnText}
            onPress={() => startPollForm()}
            text="+ Create Poll"
          />
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  pollSidebar: {
    display: 'flex',
    flex: 1,
  },
  pollFooter: {
    padding: 12,
    backgroundColor: $config.CARD_LAYER_3_COLOR,
  },
  emptyCard: {
    maxWidth: 220,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyCardIcon: {
    width: 72,
    height: 72,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: $config.CARD_LAYER_3_COLOR,
  },
  emptyView: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  emptyText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    lineHeight: 20,
    textAlign: 'center',
  },
  scrollViewContent: {},
  bodyXSmallText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    lineHeight: 16,
  },
  btnContainer: {
    minWidth: 150,
    height: 36,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  btnText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default PollSidebar;

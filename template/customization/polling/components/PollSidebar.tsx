import React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {PrimaryButton, ThemeConfig, $config} from 'customization-api';
import {usePoll} from '../context/poll-context';
import PollList from './PollList';

const PollSidebar = () => {
  const {startPollForm, isHost} = usePoll();

  return (
    <View style={style.pollSidebar}>
      {/* Header */}
      {isHost ? (
        <>
          <View style={style.headerSection}>
            <View style={style.headerCard}>
              <Text style={style.bodyXSmallText}>
                Create a new poll and boost interaction with your audience
                members now!
              </Text>
              <View>
                <PrimaryButton
                  containerStyle={style.btnContainer}
                  textStyle={style.btnText}
                  onPress={() => startPollForm()}
                  text="Create Poll"
                />
              </View>
            </View>
          </View>
          <View style={style.separator} />
        </>
      ) : (
        <></>
      )}
      <PollList />
    </View>
  );
};

const style = StyleSheet.create({
  pollSidebar: {
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  headerSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 16,
    padding: 20,
    backgroundColor: $config.CARD_LAYER_3_COLOR,
    borderRadius: 15,
  },
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
  separator: {
    marginVertical: 24,
    height: 1,
    display: 'flex',
    backgroundColor: $config.CARD_LAYER_3_COLOR,
  },
});

export default PollSidebar;

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PollCard} from './PollCard';
import {usePoll} from '../context/poll-context';
import {ThemeConfig} from 'customization-api';

export default function PollList() {
  const {polls, isHost} = usePoll();

  return (
    <View>
      <View>
        <Text style={style.titleText}>
          Past Polls ({Object.keys(polls).length})
        </Text>
      </View>
      <View>
        {polls && Object.keys(polls).length > 0 ? (
          Object.keys(polls).map((key: string) => (
            <PollCard key={key} isHost={isHost()} pollItem={polls[key]} />
          ))
        ) : (
          <></>
        )}
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  titleText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    lineHeight: 12,
  },
});

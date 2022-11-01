import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface PropsInterface {
  title: string;
  count?: number;
}

export default function ParticipantSectionTitle(props: PropsInterface) {
  const {title, count = 0} = props;
  return (
    <View style={style.subheadingContainer}>
      <Text style={style.subheading}>
        {title} {count > 0 ? '(' + count + ')' : ''}
      </Text>
    </View>
  );
}

const style = StyleSheet.create({
  subheadingContainer: {
    backgroundColor: '#F6F8FA',
  },
  subheading: {
    fontSize: 12,
    fontFamily: 'Source Sans Pro',
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 12,
    paddingLeft: 22,
  },
});

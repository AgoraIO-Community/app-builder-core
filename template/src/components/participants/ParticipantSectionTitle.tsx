import React from 'react';
import {StyleSheet, Text} from 'react-native';

interface PropsInterface {
  title: string;
  count?: number;
}

export default function ParticipantSectionTitle(props: PropsInterface) {
  const {title, count} = props;
  return (
    <Text style={style.subheading}>
      {title} <Text style={style.count}>({count})</Text>
    </Text>
  );
}

const style = StyleSheet.create({
  subheading: {
    fontSize: 15,
    letterSpacing: 0.8,
    fontWeight: '700',
    color: $config.PRIMARY_FONT_COLOR,
  },
  count: {
    fontSize: 13,
    fontWeight: '500',
  },
});

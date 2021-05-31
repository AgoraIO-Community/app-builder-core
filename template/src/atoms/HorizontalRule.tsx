import React from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';

export default function HorizontalRule(props: ViewProps) {
  return <View style={[styles.ruler, props?.style]} />;
}

const styles = StyleSheet.create({
  ruler: {
    borderBottomColor: $config.PRIMARY_COLOR + '80',
    borderBottomWidth: 1,
    margin: '2%',
    width: '100%',
    maxWidth: 200,
  },
});

import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React from 'react';

interface LinkButtonProps {
  onPress: () => void;
  text: string;
}

const LinkButton = ({onPress, text}: LinkButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.text}> {text} </Text>
    </TouchableOpacity>
  );
};

export default LinkButton;

const styles = StyleSheet.create({
  text: {
    color: $config.PRIMARY_COLOR,
    fontWeight: '600',
  },
});

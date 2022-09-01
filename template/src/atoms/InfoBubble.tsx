import {StyleSheet, Image, View, Pressable, Text} from 'react-native';
import React from 'react';
import icons from '../assets/icons';

interface InfoBubbleProps {
  text: string;
}

const InfoBubble = (props: InfoBubbleProps) => {
  const [showLabel, setShowLabel] = React.useState(false);
  return (
    <Pressable
      onPress={() => setShowLabel(!showLabel)}
      style={styles.container}>
      <Text style={[styles.infoText, {opacity: showLabel ? 1 : 0}]}>
        {props.text}
      </Text>
      <Image
        style={{
          width: 16,
          height: 16,
        }}
        source={{uri: icons.info}}
      />
    </Pressable>
  );
};

export default InfoBubble;

const styles = StyleSheet.create({
  infoText: {
    fontSize: 12,
    position: 'absolute',
    top: -45,
    left: -20,
    borderWidth: 1,
    padding: 5,
    backgroundColor: '#ffffff',
    borderColor: '#f2f2f2',
    borderRadius: 12,
    minWidth: 100,
  },
  container: {
    position: 'relative',
  },
});

import {ImageIcon} from '../../../agora-rn-uikit';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface PropsInterface {
  title: string;
  count?: number;
}

export default function ParticipantSectionTitle(props: PropsInterface) {
  const {title, count = 0} = props;
  return (
    <View style={style.container}>
      <Text style={style.subheading}>
        {title} {count > 0 ? '(' + count + ')' : ''}
      </Text>
      <ImageIcon name="downArrowTriangle" style={style.icon} />
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F6F8FA',
    paddingHorizontal: 20,
  },
  subheading: {
    fontSize: 12,
    fontFamily: 'Source Sans Pro',
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 12,
    alignSelf: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    paddingVertical: 8,
    alignSelf: 'center',
  },
});

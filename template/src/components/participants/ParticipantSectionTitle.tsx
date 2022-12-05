import ImageIcon from '../../atoms/ImageIcon';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ThemeConfig from '../../theme';

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
      <View style={style.iconView}>
        <ImageIcon
          name="arrow-down"
          iconSize="medium"
          tintColor={$config.SECONDARY_ACTION_COLOR}
        />
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    paddingHorizontal: 20,
  },
  subheading: {
    fontSize: 12,
    fontFamily: 'Source Sans Pro',
    fontWeight: '700',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    paddingVertical: 12,
    alignSelf: 'center',
  },
  iconView: {
    paddingVertical: 8,
    alignSelf: 'center',
  },
});

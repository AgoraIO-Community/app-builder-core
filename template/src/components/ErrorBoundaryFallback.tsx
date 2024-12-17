import React from 'react';
import {Text, View, StyleSheet, ScrollView} from 'react-native';
import Card from '../atoms/Card';
import ThemeConfig from '../theme';

export const ErrorBoundaryFallback = () => {
  return (
    <View style={style.root}>
      <ScrollView contentContainerStyle={style.main}>
        <Card>
          <View>
            <Text style={style.text}>
              An unexpected error occurred. Please try again.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const style = StyleSheet.create({
  logoContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  root: {
    flex: 1,
  },
  main: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    fontSize: ThemeConfig.FontSize.large,
    fontWeight: '400',
    lineHeight: ThemeConfig.FontSize.large,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    opacity: ThemeConfig.EmphasisOpacity.high,
  },
});

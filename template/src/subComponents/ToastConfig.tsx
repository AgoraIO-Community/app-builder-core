/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
// @ts-nocheck
import React from 'react';
import {Platform, TouchableOpacity, View, StyleSheet} from 'react-native';
import ThemeConfig from '../theme';
import Toast, {BaseToast} from '../../react-native-toast-message';
import CheckBoxBaseToast from '../../react-native-toast-message/src/components/checkbox';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import ImageIcon from '../atoms/ImageIcon';
import {IconsInterface} from 'src/atoms/CustomIcon';
import {autoUpdater} from 'electron';

const trailingIcon = (
  <TouchableOpacity
    onPress={() => Toast.hide()}
    style={{marginLeft: 8, marginTop: 8}}>
    <ImageIcon
      iconType="plain"
      tintColor={$config.SECONDARY_ACTION_COLOR}
      name="close"
      iconSize={24}
    />
  </TouchableOpacity>
);

const leadingIcon = (iconName: keyof IconsInterface, color: string) => {
  return (
    <View style={{marginRight: 4, width: 24, height: 24}}>
      <ImageIcon
        iconType="plain"
        tintColor={color}
        name={iconName}
        iconSize={24}
      />
    </View>
  );
};

const ToastConfig = {
  /* 
      overwrite 'success' type, 
      modifying the existing `BaseToast` component
    */
  success: ({text1, text2, props, ...rest}) => (
    <BaseToast
      {...rest}
      //BaseToast is modified to have zIndex: 100
      leadingIcon={leadingIcon('tick-fill', $config.SEMANTIC_SUCCESS)}
      trailingIcon={trailingIcon}
      style={{
        borderRadius: 4,
        borderTopWidth: 4,
        backgroundColor: $config.CARD_LAYER_4_COLOR,
        //width: !isMobileOrTablet() ? '40%' : '95%',
        width: '100%',
        borderTopColor: $config.SEMANTIC_SUCCESS,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 16,
      }}
      contentContainerStyle={styles.contentContainerStyle}
      text1Style={styles.text1Style}
      text2Style={styles.text2Style}
      text1={text1}
      text2={text2}
      primaryBtn={null}
      secondaryBtn={null}
    />
  ),
  error: ({text1, text2, props, ...rest}) => (
    <BaseToast
      {...rest}
      //BaseToast is modified to have zIndex: 100
      leadingIcon={leadingIcon('alert', $config.SEMANTIC_ERROR)}
      trailingIcon={trailingIcon}
      style={{
        borderRadius: 4,
        borderTopWidth: 4,
        backgroundColor: $config.CARD_LAYER_4_COLOR,
        //width: !isMobileOrTablet() ? '40%' : '95%',
        width: '100%',
        borderTopColor: $config.SEMANTIC_ERROR,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 16,
      }}
      contentContainerStyle={styles.contentContainerStyle}
      text1Style={styles.text1Style}
      text2Style={styles.text2Style}
      text1={text1}
      text2={text2}
      primaryBtn={null}
      secondaryBtn={null}
    />
  ),
  info: ({text1, text2, props, primaryBtn, secondaryBtn, ...rest}) => (
    <BaseToast
      {...rest}
      //BaseToast is modified to have zIndex: 100
      trailingIcon={trailingIcon}
      style={{
        height: 'auto', //primaryBtn || secondaryBtn ? 185 : text1 && text2 ? 105 : 70,
        borderRadius: ThemeConfig.BorderRadius.small,
        borderTopWidth: 4,
        backgroundColor: $config.CARD_LAYER_4_COLOR,
        width: '100%',
        borderTopColor: $config.PRIMARY_ACTION_BRAND_COLOR,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 16,
      }}
      contentContainerStyle={styles.contentContainerStyle}
      text1Style={
        primaryBtn || secondaryBtn
          ? styles.text1StyleWithCTA
          : styles.text1Style
      }
      text2Style={
        primaryBtn || secondaryBtn
          ? styles.text2StyleWithCTA
          : styles.text2Style
      }
      text1={text1}
      text2={text2}
      primaryBtn={primaryBtn ? primaryBtn : null}
      secondaryBtn={secondaryBtn ? secondaryBtn : null}
    />
  ),
  checked: ({
    text1,
    text2,
    props,
    primaryBtn,
    secondaryBtn,
    checkbox,
    ...rest
  }) => (
    <CheckBoxBaseToast
      {...rest}
      //BaseToast is modified to have zIndex: 100
      trailingIcon={trailingIcon}
      style={{
        height: primaryBtn || secondaryBtn ? 185 : text1 && text2 ? 105 : 70,
        borderRadius: 4,
        borderTopWidth: 4,
        backgroundColor: $config.CARD_LAYER_4_COLOR,
        width: '100%',
        borderTopColor: $config.PRIMARY_ACTION_BRAND_COLOR,
      }}
      contentContainerStyle={styles.contentContainerStyle}
      text1Style={styles.text1Style}
      text2Style={styles.text2Style}
      subTextStyle={styles.subTextStyle}
      text1={text1}
      text2={text2}
      primaryBtn={primaryBtn ? primaryBtn : null}
      secondaryBtn={secondaryBtn ? secondaryBtn : null}
      checkbox={checkbox}
    />
  ),
};

export default ToastConfig;

const styles = StyleSheet.create({
  text1Style: {
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 22,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '700',
    color: $config.FONT_COLOR,
    alignSelf: 'center',
  },
  text1StyleWithCTA: {
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: 22,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '700',
    color: $config.FONT_COLOR,
    alignSelf: 'center',
  },
  text2Style: {
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 22,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    marginTop: 4,
    alignSelf: 'center',
  },
  text2StyleWithCTA: {
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: 22,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    marginTop: 4,
    alignSelf: 'center',
  },
  subTextStyle: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
  },
  contentContainerStyle: {
    // paddingHorizontal:,
    // paddingTop: 12,
    // paddingBottom: 16,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  containerStyle: {},
});

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
import {Platform} from 'react-native';
import ThemeConfig from '../theme';
import Toast, {BaseToast} from '../../react-native-toast-message';
import isMobileOrTablet from '../utils/isMobileOrTablet';

const ToastConfig = {
  /* 
      overwrite 'success' type, 
      modifying the existing `BaseToast` component
    */
  success: ({text1, text2, props, ...rest}) => (
    <BaseToast
      {...rest}
      //BaseToast is modified to have zIndex: 100
      style={{
        borderRadius: 4,
        borderTopWidth: 6,
        borderTopColor: $config.SEMANTIC_SUCCESS,
        backgroundColor: $config.CARD_LAYER_4_COLOR,
        width: !isMobileOrTablet() ? '40%' : '95%',
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingTop: 20,
        paddingBottom: 25,
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
      }}
      text1Style={{
        fontSize: 16,
        fontFamily: 'Source Sans Pro',
        fontWeight: '600',
        color: $config.FONT_COLOR,
      }}
      text2Style={{
        fontSize: 16,
        fontFamily: 'Source Sans Pro',
        fontWeight: '400',
        color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
        paddingTop: 11,
      }}
      text1={text1}
      text2={text2}
      // text2={props.uuid}
    />
  ),
};

export default ToastConfig;

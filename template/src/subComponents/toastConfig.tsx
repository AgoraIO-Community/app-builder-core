import React from 'react';
import {Platform} from 'react-native';
import Toast, { BaseToast }  from '../../react-native-toast-message';

const toastConfig = {
    /* 
      overwrite 'success' type, 
      modifying the existing `BaseToast` component
    */
    success: ({ text1, text2, props, ...rest }) => (
        <BaseToast
            {...rest}
            //BaseToast is modified to have zIndex: 100
            style={{ borderLeftColor: $config.primaryColor, backgroundColor: $config.secondaryFontColor, width: Platform.OS === 'web' ? '40%' : '90%'}}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 15,
                fontWeight: '400',
                color: $config.primaryFontColor,
            }}
            text1={text1}
            text2={text2}
            // text2={props.uuid}
        />
    ),
};

export default toastConfig;
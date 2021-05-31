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
            style={{ borderLeftColor: $config.PRIMARY_COLOR, backgroundColor: $config.SECONDARY_FONT_COLOR, width: Platform.OS === 'web' ? '40%' : '90%'}}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{
                fontSize: 15,
                fontWeight: '400',
                color: $config.PRIMARY_FONT_COLOR,
            }}
            text1={text1}
            text2={text2}
            // text2={props.uuid}
        />
    ),
};

export default toastConfig;
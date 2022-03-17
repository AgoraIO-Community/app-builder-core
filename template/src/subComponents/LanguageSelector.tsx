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
import React, {useContext} from 'react';
import {Picker, StyleSheet, Text} from 'react-native';
import ColorContext from '../components/ColorContext';
import { useLanguage } from '../language/useLanguage';
import { useFpe } from 'fpe-api';
import { useString } from '../utils/getString';

const LanguageSelector = () => {
  const {primaryColor} = useContext(ColorContext);
  const {languageCode, setLanguageCode} = useLanguage(data => data);
  const languageData = useFpe(data => data.i18n);

  if(!languageData || !languageData.length){
    return <></>;
  }

  if(languageData.length === 1){
    return <></>;
  }

  return (
    <>
      <Text style={style.heading}>{useString('language')}</Text>
      <Picker
        selectedValue={languageCode}
        style={[{borderColor: primaryColor}, style.popupPicker]}
        onValueChange={(itemValue) => setLanguageCode(itemValue)}>
        {languageData.map((item) => {
            return (
              <Picker.Item
                label={item.label}
                value={item.locale}
                key={item.locale}
              />
            );
        })}
      </Picker>     
    </>
  );
};

const style = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: $config.PRIMARY_FONT_COLOR,
    // marginBottom: 20,
    alignSelf: 'center',
  },
  popupPicker: {
    height: 30,
    marginBottom: 10,
    borderRadius: 50,
    paddingHorizontal: 15,
    fontSize: 15,
    minHeight: 35,
  },
});

export default LanguageSelector;

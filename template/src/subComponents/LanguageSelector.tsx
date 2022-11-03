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
import {useLanguage} from '../language/useLanguage';
import {useCustomization} from 'customization-implementation';
import {useString} from '../utils/useString';
import {DEFAULT_I18_DATA} from '../language';

const LanguageSelector = () => {
  const {primaryColor} = useContext(ColorContext);
  const {languageCode, setLanguageCode} = useLanguage();
  const languageData = useCustomization((data) => data?.i18n);
  //commented for v1 release
  //const languageText = useString('language')();
  const languageText = 'Language';
  if (!languageData || !languageData.length) {
    return <></>;
  }

  if (
    languageData.length === 1 &&
    languageData[0].locale === DEFAULT_I18_DATA.locale
  ) {
    return <></>;
  }

  return (
    <>
      <Text style={style.heading}>{languageText}</Text>
      <Picker
        selectedValue={languageCode}
        style={[{borderColor: primaryColor}, style.popupPicker]}
        onValueChange={(itemValue) => setLanguageCode(itemValue)}>
        {languageData.map((item) => {
          return (
            <Picker.Item
              label={item.label || item.locale}
              value={item.locale}
              key={item.locale}
            />
          );
        })}
        {!languageData.filter((i) => i.locale === DEFAULT_I18_DATA.locale)
          .length ? (
          <Picker.Item
            label={DEFAULT_I18_DATA.label || DEFAULT_I18_DATA.locale}
            value={DEFAULT_I18_DATA.locale}
            key={DEFAULT_I18_DATA.locale}
          />
        ) : null}
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

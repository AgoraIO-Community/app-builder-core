import React, {useState} from 'react';
import {ToolbarItem} from 'customization-api';
import {Text, TouchableOpacity, Image, View} from 'react-native';
import useAINS from './useAINS';
import IconButton from '../../src/atoms/IconButton';

const ANISButton = () => {
  const [isANISEnabled, setIsANISEnabled] = useState(false);
  const {disableNoiseSuppression, enableNoiseSuppression} = useAINS();
  const onPress = () => {
    if (isANISEnabled) {
      disableNoiseSuppression();
      setIsANISEnabled(false);
    } else {
      enableNoiseSuppression();
      setIsANISEnabled(true);
    }
  };

  return (
    <ToolbarItem>
      <IconButton
        iconProps={{
          iconBackgroundColor: isANISEnabled
            ? $config.PRIMARY_ACTION_BRAND_COLOR
            : '',
          base64: true,
          base64TintColor: isANISEnabled
            ? $config.SECONDARY_ACTION_COLOR
            : $config.SEMANTIC_ERROR,
          name: 'ains',
          iconSize: 26,
        }}
        btnTextProps={{
          textColor: $config.FONT_COLOR,
          text: isANISEnabled ? 'AINS On' : 'AINS Off',
        }}
        onPress={onPress}
      />
      {/* <TouchableOpacity
        onPress={onPress}
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            width: 52,
            height: 52,
            padding: 13,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 50,
            backgroundColor: $config.ICON_BG_COLOR,
          }}>
          <Image
            style={{
              width: 24,
              height: 24,
              tintColor: !isANISEnabled
                ? $config.SEMANTIC_ERROR
                : $config.SECONDARY_ACTION_COLOR,
            }}
            source={{
              uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAA+ElEQVR4nN3VMUrEQBSH8V9pp6CuuldQPIKNegQvoCCsheAtBI9jYbPl1hZusXoEe1EQYWRgipDN7kwSguAH07wk/2/eEN7w35hgNFT4DQLmPSRXKSOuJUYpvIvkEPf4WieI7OIlvbDAwZrQbVxjVgmtLl0kG7jAI75XBGcFTce1l+qn+MwEFwkiZ5Vdxk72U/28ULJE/UH9gzeMW0haC0JLSSdBaCHpLAiFkl6CUCDpLQgZSZZjPOA9I1n1Cxcza9nJCT5Kw3cazvYVT/jJdFLMFi4xTaG3qR5n1B2ea5Je98kYmw31ox6jvpjqgIyXl6Ekk6HC/4Zf4jXC3h6Umh0AAAAASUVORK5CYII=',
            }}
          />
        </View>
        <Text
          style={{
            fontFamily: 'Source Sans Pro',
            fontSize: 12,
            fontWeight: '400',
            textAlign: 'center',
            marginTop: 4,
            color: $config.FONT_COLOR,
          }}>
          {!isANISEnabled ? 'ANIS Off' : 'ANIS On'}
        </Text>
      </TouchableOpacity> */}
    </ToolbarItem>
  );
};
export default ANISButton;

import React, {useState} from 'react';
import {ToolbarItem} from 'customization-api';
import useVB from './useVB';
import IconButton from '../../src/atoms/IconButton';

const VBButton = () => {
  const [isVBEnabled, setIsVBEnabled] = useState<0 | 1 | 2 | 3>(0);
  const {colorVB, disableVB, imageVB, blurVB} = useVB();

  const color = () => {
    if (isVBEnabled === 1) {
      disableVB();
      setIsVBEnabled(0);
    } else {
      colorVB();
      setIsVBEnabled(1);
    }
  };
  const blur = () => {
    if (isVBEnabled === 2) {
      disableVB();
      setIsVBEnabled(0);
    } else {
      blurVB();
      setIsVBEnabled(2);
    }
  };
  const image = () => {
    if (isVBEnabled === 3) {
      disableVB();
      setIsVBEnabled(0);
    } else {
      imageVB();
      setIsVBEnabled(3);
    }
  };

  return (
    <>
      <ToolbarItem>
        <IconButton
          iconProps={{
            iconBackgroundColor:
              isVBEnabled === 1 ? $config.PRIMARY_ACTION_BRAND_COLOR : '',
            base64: true,
            base64TintColor:
              isVBEnabled === 1
                ? $config.SECONDARY_ACTION_COLOR
                : $config.SEMANTIC_ERROR,
            name: 'demote-filled',
            iconSize: 26,
          }}
          btnTextProps={{
            textColor: $config.FONT_COLOR,
            text: isVBEnabled === 1 ? 'VB Off' : 'VB Color',
          }}
          onPress={color}
        />
      </ToolbarItem>
      <ToolbarItem>
        <IconButton
          iconProps={{
            iconBackgroundColor:
              isVBEnabled === 2 ? $config.PRIMARY_ACTION_BRAND_COLOR : '',
            base64: true,
            base64TintColor:
              isVBEnabled === 2
                ? $config.SECONDARY_ACTION_COLOR
                : $config.SEMANTIC_ERROR,
            name: 'raise-hand',
            iconSize: 26,
          }}
          btnTextProps={{
            textColor: $config.FONT_COLOR,
            text: isVBEnabled === 2 ? 'VB Off' : 'VB Blur',
          }}
          onPress={blur}
        />
      </ToolbarItem>
      <ToolbarItem>
        <IconButton
          iconProps={{
            iconBackgroundColor:
              isVBEnabled === 3 ? $config.PRIMARY_ACTION_BRAND_COLOR : '',
            base64: true,
            base64TintColor:
              isVBEnabled === 3
                ? $config.SECONDARY_ACTION_COLOR
                : $config.SEMANTIC_ERROR,
            name: 'demote-outlined',
            iconSize: 26,
          }}
          btnTextProps={{
            textColor: $config.FONT_COLOR,
            text: isVBEnabled === 3 ? 'VB Off' : 'VB Image',
          }}
          onPress={image}
        />
      </ToolbarItem>
    </>
  );
};
export default VBButton;

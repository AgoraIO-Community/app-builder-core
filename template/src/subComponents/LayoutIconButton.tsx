import React, {useContext, useState} from 'react';
import {StyleSheet} from 'react-native';

import LayoutIconDropdown from './LayoutIconDropdown';
import useLayoutsData from '../pages/video-call/useLayoutsData';
import {useChangeDefaultLayout} from '../pages/video-call/DefaultLayouts';
import {useLayout} from '../utils/useLayout';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import Styles from '../components/styles';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import ThemeConfig from '../theme';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';

interface LayoutIconButtonInterface {
  modalPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  render?: (onPress: () => void) => JSX.Element;
}

const LayoutIconButton = (props: LayoutIconButtonInterface) => {
  const {modalPosition} = props;
  //commented for v1 release
  //const layoutLabel = useString('layoutLabel')('');
  const layoutLabel = 'Layout';
  const [showDropdown, setShowDropdown] = useState(false);
  const layouts = useLayoutsData();
  const changeLayout = useChangeDefaultLayout();
  const {currentLayout} = useLayout();

  const layout = layouts.findIndex((item) => item.name === currentLayout);
  const renderLayoutIcon = (showDropdown?: boolean) => {
    let onPress = () => {};
    let renderContent = [];
    if (!showDropdown) {
      onPress = () => {
        changeLayout();
      };
    } else {
      onPress = () => {
        setShowDropdown(true);
      };
    }
    let iconButtonProps: Partial<IconButtonProps> = {
      onPress: onPress,
      btnTextProps: {
        text: $config.ICON_TEXT ? layoutLabel : '',
        textColor: $config.FONT_COLOR,
      },
    };

    renderContent.push(
      props?.render ? (
        props.render(onPress)
      ) : layouts[layout]?.iconName ? (
        <IconButton
          key={'defaultLayoutIconWithName'}
          iconProps={{
            name: layouts[layout]?.iconName,
            tintColor: $config.SECONDARY_ACTION_COLOR,
          }}
          {...iconButtonProps}
        />
      ) : (
        <IconButton
          key={'defaultLayoutIconWithIcon'}
          iconProps={{
            icon: layouts[layout]?.icon,
            tintColor: '#099DFD',
          }}
          {...iconButtonProps}
        />
      ),
    );
    return renderContent;
  };
  return (
    <>
      {/**
       * Based on the flag. it will render the dropdown
       */}
      <LayoutIconDropdown
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        modalPosition={modalPosition}
      />
      {/**
       * If layout contains more than 2 data. it will render the dropdown.
       */}
      {layouts && Array.isArray(layouts) && layouts.length > 1
        ? renderLayoutIcon(true)
        : renderLayoutIcon(false)}
    </>
  );
};

const style = StyleSheet.create({
  btnHolder: {
    marginHorizontal: isMobileOrTablet() ? 2 : 0,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});

export default LayoutIconButton;

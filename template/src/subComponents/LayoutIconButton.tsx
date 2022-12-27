import React, {useEffect, useRef, useState} from 'react';

import LayoutIconDropdown from './LayoutIconDropdown';
import useLayoutsData from '../pages/video-call/useLayoutsData';
import {useChangeDefaultLayout} from '../pages/video-call/DefaultLayouts';
import {useLayout} from '../utils/useLayout';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import {isWeb} from 'customization-api';

interface LayoutIconButtonInterface {
  render?: (onPress: () => void) => JSX.Element;
}

const LayoutIconButton = (props: LayoutIconButtonInterface) => {
  const [isHovered, setIsHovered] = useState(false);
  //commented for v1 release
  //const layoutLabel = useString('layoutLabel')('');
  const layoutLabel = 'Layout';
  const layouts = useLayoutsData();
  const changeLayout = useChangeDefaultLayout();
  const {currentLayout, setLayout} = useLayout();

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
        setIsHovered(true);
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
      ) : (
        <PlatformWrapper showDropdown={isHovered} setIsHovered={setIsHovered}>
          <IconButton
            key={'defaultLayoutIconWithName'}
            iconProps={{
              name: layouts[layout]?.iconName,
              tintColor: $config.SECONDARY_ACTION_COLOR,
            }}
            {...iconButtonProps}
          />
        </PlatformWrapper>
      ),
    );
    return renderContent;
  };
  return (
    <>
      {/**
       * Based on the flag. it will render the dropdown
       */}
      <PlatformWrapperPopup setIsHovered={setIsHovered}>
        <LayoutIconDropdown
          showDropdown={isHovered}
          setShowDropdown={setIsHovered}
        />
      </PlatformWrapperPopup>
      {/**
       * If layout contains more than 2 data. it will render the dropdown.
       */}
      {layouts && Array.isArray(layouts) && layouts.length > 1
        ? renderLayoutIcon(true)
        : renderLayoutIcon(false)}
    </>
  );
};
const PlatformWrapper = ({children, ...props}) => {
  return isWeb() ? (
    <div
      onMouseEnter={() => {
        props?.setIsHovered(true);
      }}
      onMouseLeave={() => {
        props?.setIsHovered(false);
      }}>
      {children}
    </div>
  ) : (
    children
  );
};
const PlatformWrapperPopup = ({children, ...props}) => {
  return isWeb() ? (
    <div
      onMouseEnter={() => {
        props?.setIsHovered(true);
      }}
      onMouseLeave={() => {
        props?.setIsHovered(false);
      }}>
      {children}
    </div>
  ) : (
    children
  );
};

export default LayoutIconButton;

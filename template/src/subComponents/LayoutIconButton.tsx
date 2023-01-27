import React, {useState, useRef} from 'react';

import LayoutIconDropdown from './LayoutIconDropdown';
import useLayoutsData from '../pages/video-call/useLayoutsData';
import {useChangeDefaultLayout} from '../pages/video-call/DefaultLayouts';
import {useLayout} from '../utils/useLayout';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import {Dimensions} from 'react-native';
import {isMobileUA} from '../utils/common';
import isMobileOrTablet from '../utils/isMobileOrTablet';

interface LayoutIconButtonInterface {
  render?: (onPress: () => void) => JSX.Element;
  showLabel?: boolean;
}

const LayoutIconButton = (props: LayoutIconButtonInterface) => {
  const windowHeight = Dimensions.get('window').height;
  const [modalPosition, setModalPosition] = useState(null);
  const layoutBtnRef = useRef();
  const [isHovered, setIsHoveredLocal] = useState(false);
  const [isHoveredOnModal, setIsHoveredOnModal] = useState(false);
  const isMobileView = isMobileUA();
  const {showLabel = $config.ICON_TEXT} = props;
  const setIsHovered = (hovered: boolean) => {
    if (layoutBtnRef && layoutBtnRef.current) {
      layoutBtnRef?.current?.measure((_fx, _fy, _w, h, _px, _py) => {
        setModalPosition({
          bottom: isMobileOrTablet()
            ? windowHeight - _py + 10
            : windowHeight - _py - 10,
          left: isMobileOrTablet() ? _px - 10 : -10,
        });
        setIsHoveredLocal(hovered);
      });
    }
  };
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
        setIsHovered(!isHovered);
      };
    }
    let iconButtonProps: Partial<IconButtonProps> = {
      onPress: onPress,
      btnTextProps: {
        text: showLabel ? layoutLabel : '',
        textColor: $config.FONT_COLOR,
      },
    };
    const iconName =
      layouts[layout]?.iconName === 'pinned' && isMobileView
        ? 'list-view'
        : layouts[layout]?.iconName;

    renderContent.push(
      props?.render ? (
        props.render(onPress)
      ) : (
        <PlatformWrapper
          key={'layout-icon-btn'}
          showDropdown={isHovered}
          setIsHovered={(flag) => {
            if (flag) {
              setIsHovered(true);
            } else {
              if (isMobileOrTablet()) {
                setIsHovered(false);
              } else {
                setTimeout(() => {
                  setIsHovered(false);
                }, 500);
              }
            }
          }}>
          <IconButton
            setRef={(ref) => {
              layoutBtnRef.current = ref;
            }}
            key={'defaultLayoutIconWithName'}
            iconProps={{
              name: iconName,
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
      <PlatformWrapperPopup
        setIsHovered={isMobileOrTablet() ? setIsHovered : setIsHoveredOnModal}>
        <LayoutIconDropdown
          modalPosition={modalPosition}
          showDropdown={
            isMobileOrTablet() ? isHovered : isHovered || isHoveredOnModal
          }
          setShowDropdown={
            isMobileOrTablet() ? setIsHovered : setIsHoveredOnModal
          }
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
  return !isMobileOrTablet() ? (
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
  return !isMobileOrTablet() ? (
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

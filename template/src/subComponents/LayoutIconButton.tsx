import React, {useContext, useState} from 'react';
import {StyleSheet} from 'react-native';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import {BtnTemplate, BtnTemplateInterface} from '../../agora-rn-uikit';

import LayoutIconDropdown from './LayoutIconDropdown';
import useLayoutsData from '../pages/video-call/useLayoutsData';
import {useChangeDefaultLayout} from '../pages/video-call/DefaultLayouts';
import {useLayout} from '../utils/useLayout';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import Styles from '../components/styles';

interface LayoutIconButtonInterface {
  modalPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

const LayoutIconButton = (props: LayoutIconButtonInterface) => {
  const {modalPosition} = props;
  //commented for v1 release
  //const layoutLabel = useString('layoutLabel')('');
  const layoutLabel = 'Layout';
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
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
    let btnTemplateProps: BtnTemplateInterface = {
      onPress: onPress,
      styleIcon: {
        width: 24,
        height: 24,
      },
    };
    btnTemplateProps.styleText = {
      fontFamily: 'Source Sans Pro',
      fontSize: 12,
      marginTop: 4,
      fontWeight: '400',
      color: $config.PRIMARY_COLOR,
    };
    if (buttonTemplateName === ButtonTemplateName.topBar) {
      btnTemplateProps.style = Styles.localButtonSmall as Object;
    } else {
      btnTemplateProps.style = Styles.localButton as Object;
      btnTemplateProps.btnText = layoutLabel;
    }
    renderContent.push(
      props?.render ? (
        props.render(onPress, buttonTemplateName)
      ) : layouts[layout]?.iconName ? (
        <BtnTemplate
          key={'defaultLayoutIconWithName'}
          name={layouts[layout]?.iconName}
          {...btnTemplateProps}
        />
      ) : (
        <BtnTemplate
          key={'defaultLayoutIconWithIcon'}
          icon={layouts[layout]?.icon}
          {...btnTemplateProps}
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

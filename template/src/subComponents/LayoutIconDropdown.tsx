import React, {SetStateAction, useContext} from 'react';
import {View, StyleSheet, TouchableWithoutFeedback, Modal} from 'react-native';
import {isWeb} from '../utils/common';
import useLayoutsData from '../pages/video-call/useLayoutsData';
import {useLayout} from '../utils/useLayout';
import DimensionContext from '../components/dimension/DimensionContext';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import Spacer from '../atoms/Spacer';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {getPinnedLayoutName} from '../pages/video-call/DefaultLayouts';
import {useRender} from 'customization-api';

interface LayoutIconDropdownProps {
  modalPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  showDropdown: boolean;
  setShowDropdown: React.Dispatch<SetStateAction<boolean>>;
}

const LayoutIconDropdown = (props: LayoutIconDropdownProps) => {
  const {
    showDropdown,
    setShowDropdown,
    modalPosition = {top: 0, left: 0},
  } = props;
  const {getDimensionData} = useContext(DimensionContext);
  const {isDesktop, dim} = getDimensionData();
  const {activeUids} = useRender();
  const layouts = useLayoutsData();
  const {setLayout, currentLayout} = useLayout();

  const renderDropdown = () => {
    const data = layouts.map((item, index) => {
      let onPress = () => {
        setLayout(item.name);
        setShowDropdown(false);
      };
      let content = [];
      const disabled =
        item.name === getPinnedLayoutName() && activeUids?.length === 1
          ? true
          : false;
      let iconButtonProps: IconButtonProps = {
        disabled,
        hoverEffect: disabled
          ? false
          : currentLayout !== item.name
          ? true
          : false,
        hoverEffectStyle: {
          backgroundColor:
            $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['15%'],
        },
        containerStyle: {
          opacity: disabled ? 0.4 : 1,
          flexDirection: 'row',
          marginHorizontal: 8,
          marginTop: 8,
          marginBottom: layouts.length - 1 === index ? 8 : 0,
          borderRadius: 4,
          backgroundColor:
            currentLayout === item.name
              ? $config.PRIMARY_ACTION_BRAND_COLOR
              : 'transparent',
        },
        onPress,
        iconProps: {
          iconContainerStyle: {
            padding: 10,
          },
          iconType: 'plain',
          name: item.iconName,
          tintColor: $config.SECONDARY_ACTION_COLOR,
        },
        btnTextProps: {
          textStyle: {
            marginTop: 0,
          },
          text: $config.ICON_TEXT ? item.label : '',
          textColor: $config.FONT_COLOR,
        },
      };
      content.push(<IconButton {...iconButtonProps} />);
      return content;
    });

    let viewContent = (
      <View style={[style.dropdownContainer, modalPosition]}>
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: $config.CARD_LAYER_4_COLOR,
            position: 'absolute',
            bottom: -8,
            left: 26,
            borderRadius: 2,
            transform: [{rotate: '45deg'}],
          }}></View>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
          {data}
        </View>
      </View>
    );

    return false ? (
      showDropdown ? (
        viewContent
      ) : (
        <></>
      )
    ) : (
      <Modal
        animationType="none"
        transparent={true}
        visible={showDropdown}
        onRequestClose={() => {
          setShowDropdown(false);
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            setShowDropdown(false);
          }}>
          <View style={style.backDrop} />
        </TouchableWithoutFeedback>
        {viewContent}
      </Modal>
    );
  };
  return <>{renderDropdown()}</>;
};

const style = StyleSheet.create({
  dropdownContainer: {
    width: 140,
    position: 'absolute',
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    borderRadius: 8,
    zIndex: 999,
    shadowColor:
      $config.HARD_CODED_BLACK_COLOR + hexadecimalTransparency['10%'],
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
  },
  backDrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default LayoutIconDropdown;

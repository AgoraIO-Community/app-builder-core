import React, {SetStateAction, useContext} from 'react';
import {View, StyleSheet, TouchableWithoutFeedback, Modal} from 'react-native';
import {isWeb} from '../utils/common';
import useLayoutsData from '../pages/video-call/useLayoutsData';
import {useLayout} from '../utils/useLayout';
import DimensionContext from '../components/dimension/DimensionContext';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import Spacer from '../atoms/Spacer';

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

  const layouts = useLayoutsData();
  const {setLayout} = useLayout();

  const renderDropdown = () => {
    const data = layouts.map((item, index) => {
      let onPress = () => {
        setLayout(item.name);
        setShowDropdown(false);
      };
      let content = [];
      let iconButtonProps: IconButtonProps = {
        onPress,
        iconProps: {
          name: item.iconName,
          tintColor: $config.SECONDARY_ACTION_COLOR,
        },
        btnTextProps: {
          text: $config.ICON_TEXT ? item.label : '',
          textColor: $config.FONT_COLOR,
        },
      };
      content.push(<IconButton {...iconButtonProps} />);
      if (layouts.length - 1 !== index) {
        content.push(<Spacer horizontal={true} size={20} />);
      }

      return content;
    });

    let viewContent = (
      <View style={[style.dropdownContainer, modalPosition]}>
        <View
          style={{
            width: 20,
            height: 20,
            backgroundColor: $config.CARD_LAYER_3_COLOR,
            position: 'absolute',
            bottom: -8,
            left: 26,
            borderRadius: 2,
            transform: [{rotate: '45deg'}],
          }}></View>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
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
    position: 'absolute',
    backgroundColor: $config.CARD_LAYER_3_COLOR,
    borderRadius: 8,
    padding: 12,
    paddingBottom: 20,
    zIndex: 999,
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

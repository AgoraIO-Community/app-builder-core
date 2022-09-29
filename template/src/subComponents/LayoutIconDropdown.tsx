import React, {SetStateAction, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import {isWebInternal} from '../utils/common';
import {ImageIcon} from '../../agora-rn-uikit';
import useLayoutsData from '../pages/video-call/useLayoutsData';
import {useLayout} from '../utils/useLayout';
import DimensionContext from '../components/dimension/DimensionContext';

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
    modalPosition = {top: 45, right: 15, bottom: undefined, left: undefined},
  } = props;
  const {getDimensionData} = useContext(DimensionContext);
  const {isDesktop, dim} = getDimensionData();

  const layouts = useLayoutsData();
  const {currentLayout, setLayout} = useLayout();
  const renderSeparatorHorizontal = () => {
    return isWebInternal() && isDesktop ? (
      <View style={style.navItem}>
        <View style={style.navItemSeparatorHorizontal}></View>
      </View>
    ) : (
      <View style={{marginHorizontal: 2}}></View>
    );
  };
  const selectedItemHighlighter = (isSelected: boolean) => {
    return <View style={isSelected ? style.highlighter : {}} />;
  };
  const renderDropdown = () => {
    const data = layouts.map((item, index) => {
      let onPress = () => {
        setLayout(item.name);
        setShowDropdown(false);
      };
      let content = [];
      let BtnTemplateLocal = [
        item?.iconName ? (
          <ImageIcon
            key={'btnTemplateNameDropdown' + index}
            style={style.btnHolderCustom}
            name={item?.iconName}
          />
        ) : (
          <ImageIcon
            key={'btnTemplateIconDropdown' + index}
            style={style.btnHolderCustom}
            icon={item.icon}
          />
        ),
      ];
      content.push(
        <TouchableOpacity
          key={'dropdownLayoutIcon' + index}
          style={style.dropdownInnerIconContainer}
          onPress={onPress}>
          <>
            <View style={style.highlighterContainer}>
              {selectedItemHighlighter(item.name === currentLayout)}
            </View>
            <View style={{flex: 1}}>{BtnTemplateLocal}</View>
            <View style={style.layoutNameContainer}>
              <Text numberOfLines={2} style={style.layoutNameText}>
                {item.label}
              </Text>
            </View>
          </>
        </TouchableOpacity>,
      );
      if (layouts.length - 1 !== index) {
        content.push(
          <View
            style={style.separaterContainer}
            key={'navLayoutIconSeparater' + index}>
            {renderSeparatorHorizontal()}
          </View>,
        );
      }
      return content;
    });
    return (
      <Modal
        animationType="fade"
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
        <View
          style={[
            style.dropdownContainer,
            {
              top: modalPosition?.top,
              right: modalPosition?.right,
              left: modalPosition?.left,
              bottom: modalPosition?.bottom,
            },
          ]}>
          {data}
        </View>
      </Modal>
    );
  };
  return <>{renderDropdown()}</>;
};

const style = StyleSheet.create({
  layoutNameContainer: {
    flex: 2,
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  layoutNameText: {
    textAlign: 'left',
  },
  highlighter: {
    justifyContent: 'center',
    alignSelf: 'center',
    height: 1,
    width: 1,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: $config.PRIMARY_COLOR,
  },
  highlighterContainer: {flex: 0.5, justifyContent: 'center'},
  dropdownInnerIconContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 5,
    paddingVertical: 5,
    minHeight: 40,
  },
  navItem: {
    height: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  navItemSeparatorHorizontal: {
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    width: '100%',
    height: 1,
    marginVertical: 10,
    alignSelf: 'center',
    opacity: 0.8,
  },
  separaterContainer: {
    flex: 0.5,
    paddingHorizontal: 5,
  },
  dropdownContainer: {
    position: 'absolute',
    marginTop: 5,
    width: 160,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
  },
  btnHolderCustom: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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

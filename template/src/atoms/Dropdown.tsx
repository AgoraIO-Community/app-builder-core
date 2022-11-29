import React, {FC, ReactElement, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  View,
  Image,
} from 'react-native';
import {isWeb} from '../utils/common';
import ThemeConfig from '../theme';
import ImageIcon from './ImageIcon';

interface Props {
  label: string;
  data: Array<{label: string; value: string}>;
  onSelect: (item: {label: string; value: string}) => void;
  enabled: boolean;
  selectedValue: string;
}

const Dropdown: FC<Props> = ({
  label,
  data,
  onSelect,
  enabled,
  selectedValue,
}) => {
  const DropdownButton = useRef();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(undefined);
  const [dropdownPos, setDropdownPos] = useState({top: 0, left: 0, width: 0});
  const [isHovered, setIsHovered] = React.useState(false);

  useEffect(() => {
    if (selectedValue && data && data.length) {
      const selectedItem = data?.filter((i) => i.value == selectedValue);
      if (selectedItem && selectedItem.length) {
        setSelected(selectedItem[0]);
      }
    }
  }, [selectedValue]);

  const toggleDropdown = (): void => {
    visible ? setVisible(false) : openDropdown();
  };

  const updateDropdownPosition = () => {
    //@ts-ignore
    DropdownButton?.current?.measure((_fx, _fy, _w, h, _px, py) => {
      setDropdownPos({
        top: py + h,
        left: _px,
        width: _w,
      });
    });
  };

  const openDropdown = (): void => {
    updateDropdownPosition();
    setVisible(true);
  };

  const onItemPress = (item): void => {
    setSelected(item);
    onSelect(item);
    setVisible(false);
  };

  const renderItem = ({item}): ReactElement<any, any> => (
    <PlatformWrapper onPress={() => onItemPress(item)}>
      <View style={styles.itemContainer}>
        <View style={styles.itemTextContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.itemText,
              selected && item?.value === selected?.value
                ? styles.itemTextSelected
                : {},
            ]}>
            {item.label}
          </Text>
        </View>
        {selected && item?.value === selected?.value ? (
          <View style={styles.itemTextSelectedContainer}>
            <ImageIcon
              name={'tick'}
              customSize={{width: 12, height: 9}}
              tintColor={'#099DFD'}
            />
          </View>
        ) : (
          <></>
        )}
      </View>
    </PlatformWrapper>
  );

  const renderDropdown = (): ReactElement<any, any> => {
    return (
      <Modal visible={visible} transparent animationType="none">
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setVisible(false)}>
          <View
            style={[
              styles.dropdown,
              {
                top: dropdownPos.top + 4,
                left: dropdownPos.left,
                width: dropdownPos.width,
              },
            ]}>
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const noData = !data || !data.length;

  return (
    <TouchableOpacity
      disabled={!enabled || !data || !data.length}
      ref={DropdownButton}
      style={[
        noData ? styles.dropdownOptionNoData : styles.dropdownOption,
        !enabled || !data || !data.length
          ? {opacity: ThemeConfig.EmphasisOpacity.disabled}
          : {},
      ]}
      onPress={toggleDropdown}>
      {enabled && !noData ? renderDropdown() : <></>}
      <View
        onLayout={() => updateDropdownPosition()}
        style={styles.dropdownOptionTextContainer}>
        <Text
          numberOfLines={1}
          style={
            noData ? styles.dropdownOptionNoDataText : styles.dropdownOptionText
          }>
          {(selected && selected.label) || label}
        </Text>
      </View>
      <View style={styles.dropdownIconContainer}>
        <ImageIcon
          name={visible ? 'arrowUp' : 'arrowDown'}
          tintColor={noData ? '#A1A1A1' : '#000000'}
        />
      </View>
    </TouchableOpacity>
  );
};

const PlatformWrapper = ({children, onPress}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  return isWeb() ? (
    <div
      style={{
        backgroundColor: isHovered ? '#EFEFEF' : 'transparent',
        cursor: isHovered ? 'pointer' : 'auto',
        borderRadius: 6,
        marginLeft: 8,
        marginRight: 8,
      }}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onClick={onPress}>
      {children}
    </div>
  ) : (
    <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dropdownOption: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 60,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderRadius: 12,
  },
  dropdownOptionTextContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  dropdownOptionText: {
    flex: 1,
    textAlign: 'left',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.extraSmall,
    lineHeight: ThemeConfig.FontSize.extraSmall,
    color: $config.FONT_COLOR,
    paddingLeft: 20,
    paddingVertical: 23,
  },
  dropdownOptionNoData: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 60,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 12,
  },
  dropdownOptionNoDataText: {
    flex: 1,
    textAlign: 'left',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.extraSmall,
    lineHeight: ThemeConfig.FontSize.extraSmall,
    color: $config.FONT_COLOR,
    paddingLeft: 20,
    paddingVertical: 23,
  },
  dropdownIconContainer: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_2_COLOR,
    shadowColor: $config.HARD_CODED_CARD_SHADOW_COLOR,
    shadowOffset: {width: 5, height: 5},
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 5,
    paddingVertical: 10,
  },
  overlay: {
    width: '100%',
    height: '100%',
  },
  itemContainer: {
    //backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    marginHorizontal: 8,
    minHeight: 40,
    flex: 1,
    flexDirection: 'row',
  },
  itemTextContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  itemText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: ThemeConfig.FontSize.small,
    color: $config.FONT_COLOR,
    paddingVertical: 12,
    paddingLeft: 12,
  },
  itemTextSelected: {
    fontWeight: '400',
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  itemTextSelectedContainer: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Dropdown;

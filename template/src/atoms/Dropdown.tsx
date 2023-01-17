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
import {isWeb, isWebInternal} from '../utils/common';
import ThemeConfig from '../theme';
import ImageIcon from './ImageIcon';
import {IconsInterface} from './CustomIcon';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';

interface Props {
  label: string;
  icon?: keyof IconsInterface;
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
  icon,
}) => {
  const DropdownButton = useRef();
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(undefined);
  const [dropdownPos, setDropdownPos] = useState({top: 0, left: 0, width: 0});
  const [isHovered, setIsHovered] = React.useState(false);

  useEffect(() => {
    if (isWebInternal()) {
      window.addEventListener('resize', () => {
        setVisible(false);
      });
    }
  }, []);

  useEffect(() => {
    if (selectedValue && data && data.length) {
      const selectedItem = data?.filter((i) => i.value == selectedValue);
      if (selectedItem && selectedItem.length) {
        setSelected(selectedItem[0]);
      }
    }
  }, [selectedValue, data]);

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
              iconType="plain"
              name={'tick'}
              iconSize={12}
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
                top: dropdownPos.top,
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
        styles.dropdownOptionContainer,
        !enabled || !data || !data.length
          ? {opacity: ThemeConfig.EmphasisOpacity.disabled}
          : {},
        visible
          ? {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              borderBottomWidth: 0,
            }
          : {},
      ]}
      onPress={toggleDropdown}>
      {enabled && !noData ? renderDropdown() : <></>}
      <View
        style={{flex: 1, justifyContent: 'flex-start', flexDirection: 'row'}}>
        {icon ? (
          <View style={styles.dropdownIconContainer}>
            <ImageIcon
              iconType="plain"
              name={icon}
              iconSize={20}
              tintColor={$config.SEMANTIC_NETRUAL}
            />
          </View>
        ) : (
          <></>
        )}
        <View
          // onLayout={() => updateDropdownPosition()}
          style={[styles.dropdownOptionTextContainer]}>
          <Text numberOfLines={1} style={styles.dropdownOptionText}>
            {(selected && selected.label) || label}
          </Text>
        </View>
      </View>
      <View style={styles.dropdownIconContainer}>
        <ImageIcon
          iconType="plain"
          name={visible ? 'arrow-up' : 'arrow-down'}
          tintColor={$config.SECONDARY_ACTION_COLOR}
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
        backgroundColor: isHovered
          ? $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['20%']
          : 'transparent',
        cursor: isHovered ? 'pointer' : 'auto',
      }}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onClick={(e) => {
        e.preventDefault();
        onPress && onPress();
      }}>
      {children}
    </div>
  ) : (
    <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dropdownOptionContainer: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 60,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderRadius: 12,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'space-between',
  },
  dropdownOptionTextContainer: {
    alignSelf: 'center',
    flex: 1,
  },
  dropdownOptionText: {
    textAlign: 'left',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.normal,
    color: $config.FONT_COLOR,
    paddingLeft: 8,
    paddingVertical: 20,
  },
  dropdownIconContainer: {
    alignSelf: 'center',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderBottomColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderLeftColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderRightColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderTopColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 2,
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  overlay: {
    width: '100%',
    height: '100%',
  },
  itemContainer: {
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
    fontSize: ThemeConfig.FontSize.normal,
    color: $config.SECONDARY_ACTION_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  itemTextSelected: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  itemTextSelectedContainer: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Dropdown;

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
import Icons from '../assets/icons';

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
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onItemPress(item)}>
      <View style={styles.itemTextContainer}>
        <Text
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
          <Image
            source={{uri: Icons.tickIcon}}
            style={{
              width: 12,
              height: 8,
              tintColor: '#099DFD',
            }}
          />
        </View>
      ) : (
        <></>
      )}
    </TouchableOpacity>
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
      style={noData ? styles.dropdownOptionNoData : styles.dropdownOption}
      onPress={toggleDropdown}>
      {enabled && !noData ? renderDropdown() : <></>}
      <View
        onLayout={() => updateDropdownPosition()}
        style={styles.dropdownOptionTextContainer}>
        <Text
          style={
            noData ? styles.dropdownOptionNoDataText : styles.dropdownOptionText
          }>
          {(selected && selected.label) || label}
        </Text>
      </View>
      <View style={styles.dropdownIconContainer}>
        <Image
          source={{uri: visible ? Icons.upArrowIcon : Icons.downArrowIcon}}
          style={{
            width: 12,
            height: 8,
            tintColor: noData ? '#A1A1A1' : '#000000',
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  dropdownOption: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 60,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#484848',
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
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    color: '#181818',
    paddingLeft: 20,
    paddingVertical: 23,
  },
  dropdownOptionNoData: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 60,
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
  },
  dropdownOptionNoDataText: {
    flex: 1,
    textAlign: 'left',
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    color: '#A1A1A1',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    shadowColor: '#000000',
    shadowOffset: {width: 5, height: 5},
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 5,
  },
  overlay: {
    width: '100%',
    height: '100%',
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
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
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    color: '#000000',
    paddingVertical: 12,
    paddingLeft: 12,
  },
  itemTextSelected: {
    fontWeight: '400',
    color: '#099DFD',
  },
  itemTextSelectedContainer: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Dropdown;

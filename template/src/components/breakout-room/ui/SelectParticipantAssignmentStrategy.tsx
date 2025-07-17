import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Dropdown} from 'customization-api';
import ThemeConfig from '../../../theme';
import TertiaryButton from '../../../atoms/TertiaryButton';

interface ParticipantAssignControlProps {
  onAssign: () => void;
  strategy: 'auto' | 'manually' | 'self';
  onStrategyChange: (value: string) => void;
}

const strategyList = [
  {label: 'Auto-assign people to all rooms', value: 'auto'},
  {label: 'Manually Assign participants', value: 'manually'},
  {label: 'Let people choose their rooms', value: 'self'},
];
const SelectParticipantAssignmentStrategy = () => {
  useEffect(() => {}, []);

  return (
    <>
      <Text style={style.label}>Assign participants to breakout rooms</Text>
      <Dropdown
        enabled={true}
        selectedValue={strategyList[0].value}
        label={strategyList[0].label}
        data={strategyList}
        onSelect={async ({label, value}) => {
          console.log('value: ', value);
          console.log('label: ', label);
        }}
      />
      <TertiaryButton
        containerStyle={{
          backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
          borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
        }}
        onPress={() => {}}
        text={'Assign participants'}
      />
    </>
  );
};

const style = StyleSheet.create({
  label: {
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
});
export default SelectParticipantAssignmentStrategy;

import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {Dropdown} from 'customization-api';
import ThemeConfig from '../../../theme';
import TertiaryButton from '../../../atoms/TertiaryButton';
import {RoomAssignmentStrategy} from '../state/reducer';

interface Props {
  selectedStrategy: RoomAssignmentStrategy;
  onStrategyChange: (strategy: RoomAssignmentStrategy) => void;
}

const strategyList = [
  {
    label: 'Auto-assign people to all rooms',
    value: RoomAssignmentStrategy.AUTO_ASSIGN,
  },
  {
    label: 'Manually Assign participants',
    value: RoomAssignmentStrategy.MANUAL_ASSIGN,
  },
  {
    label: 'Let people choose their rooms',
    value: RoomAssignmentStrategy.NO_ASSIGN,
  },
];
const SelectParticipantAssignmentStrategy: React.FC<Props> = ({
  selectedStrategy,
  onStrategyChange,
}) => {
  return (
    <>
      <Text style={style.label}>Assign participants to breakout rooms</Text>
      <Dropdown
        enabled={true}
        selectedValue={selectedStrategy}
        label={strategyList[0].label}
        data={strategyList}
        onSelect={async ({label, value}) => {
          onStrategyChange(value as RoomAssignmentStrategy);
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

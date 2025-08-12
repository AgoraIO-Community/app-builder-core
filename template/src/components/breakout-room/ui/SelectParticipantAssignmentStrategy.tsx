import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {Dropdown} from 'customization-api';
import ThemeConfig from '../../../theme';
import TertiaryButton from '../../../atoms/TertiaryButton';
import {RoomAssignmentStrategy} from '../state/reducer';

interface Props {
  assignParticipants: () => void;
  selectedStrategy: RoomAssignmentStrategy;
  onStrategyChange: (strategy: RoomAssignmentStrategy) => void;
  disabled: boolean;
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
  disabled = false,
  assignParticipants,
}) => {
  return (
    <>
      <Text style={style.label}>Assign participants to breakout rooms</Text>
      <Dropdown
        enabled={!disabled}
        selectedValue={selectedStrategy}
        label={strategyList[0].label}
        data={strategyList}
        onSelect={async ({label, value}) => {
          onStrategyChange(value as RoomAssignmentStrategy);
        }}
      />
      <TertiaryButton
        disabled={disabled}
        containerStyle={{
          backgroundColor: disabled
            ? $config.SEMANTIC_NEUTRAL
            : $config.PRIMARY_ACTION_BRAND_COLOR,
          borderColor: disabled
            ? $config.SEMANTIC_NEUTRAL
            : $config.PRIMARY_ACTION_BRAND_COLOR,
        }}
        onPress={() => {
          assignParticipants();
        }}
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

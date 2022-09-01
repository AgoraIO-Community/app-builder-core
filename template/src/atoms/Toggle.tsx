import {StyleSheet, Text, View, Switch, Platform} from 'react-native';
import React from 'react';

interface SwitchProps {
  isEnabled: boolean;
  disabled?: boolean;
  toggleSwitch: (isEnabled: boolean) => void;
}

const Toggle = (props: SwitchProps) => {
  const {isEnabled, toggleSwitch, disabled = false} = props;
  return (
    <View>
      <Switch
        trackColor={{false: '#A8A4A4', true: $config.PRIMARY_COLOR}}
        thumbColor={'#ffffff'}
        value={isEnabled}
        disabled={disabled}
        onValueChange={toggleSwitch}
        {...Platform.select({
          web: {
            activeThumbColor: '#ffffff',
          },
        })}
      />
    </View>
  );
};

export default Toggle;

const styles = StyleSheet.create({});

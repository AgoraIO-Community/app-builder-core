import React, {useContext} from 'react';
import {CheckBox, StyleSheet} from 'react-native';
import ColorContext from '../components/ColorContext';

/**
 * A checkbox component for the web and electron
 */
const Checkbox = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const urlCheckbox = props.value;
  const setUrlCheckbox = props.onValueChange;
  return (
    <CheckBox
      value={urlCheckbox}
      onValueChange={setUrlCheckbox}
      //@ts-ignore Color prop exists on react-native-web but it not present in @react-native-community/checkbox
      color={primaryColor ? primaryColor : '#099DFD'}
      style={styles.check}
    />
  );
};

const styles = StyleSheet.create({
  check: {width: 35, height: 35},
});

export default Checkbox;

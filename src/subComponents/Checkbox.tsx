import React from 'react';
import {CheckBox} from 'react-native';

const Checkbox = (props) => {
  const urlCheckbox = props.value;
  const setUrlCheckbox = props.onValueChange;
  return (
    <CheckBox
      value={urlCheckbox}
      onValueChange={setUrlCheckbox}
      color={'#099DFD'}
    />
  );
};

export default Checkbox;

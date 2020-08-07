import React from 'react';
import CheckBox from '@react-native-community/checkbox';

const Checkbox = (props) => {
  const urlCheckbox = props.value;
  const setUrlCheckbox = props.onValueChange;
  return (
    <CheckBox
      value={urlCheckbox}
      onValueChange={setUrlCheckbox}
      tintColors={{true: '#fff', false: '#fff'}}
    />
  );
};
export default Checkbox;

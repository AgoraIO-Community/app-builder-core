import React from 'react';
import CheckBox from '@react-native-community/checkbox';

const Checkbox = (props: any) => {
  const urlCheckbox = props.value;
  const setUrlCheckbox = props.onValueChange;
  return (
    <CheckBox
      value={urlCheckbox}
      onValueChange={setUrlCheckbox}
      tintColors={{true: '#099DFD', false: '#099DFD'}}
    />
  );
};
export default Checkbox;

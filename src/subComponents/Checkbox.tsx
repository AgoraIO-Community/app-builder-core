import React from 'react';
import {CheckBox} from 'react-native';

const Checkbox = (props: any) => {
  const urlCheckbox = props.value;
  const setUrlCheckbox = props.onValueChange;
  return (
    <CheckBox
      value={urlCheckbox}
      onValueChange={setUrlCheckbox}
      color={'#099DFD'}
      style={{width:35, height:35}}
    />
  );
};

export default Checkbox;

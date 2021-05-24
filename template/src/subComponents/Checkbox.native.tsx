import React, {useContext} from 'react';
import CheckBox from '@react-native-community/checkbox';
import ColorContext from '../components/ColorContext';

/**
 * A checkbox component for mobile
 */
const Checkbox = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const urlCheckbox = props.value;
  const setUrlCheckbox = props.onValueChange;
  return (
    <CheckBox
      value={urlCheckbox}
      onValueChange={setUrlCheckbox}
      tintColors={{
        true: primaryColor ? primaryColor : $config.primaryColor,
        false: primaryColor ? primaryColor : $config.primaryColor,
      }}
    />
  );
};
export default Checkbox;

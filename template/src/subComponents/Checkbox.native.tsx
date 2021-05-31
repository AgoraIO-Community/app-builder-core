import React, {useContext} from 'react';
import CheckBox from '@react-native-community/checkbox';

/**
 * A checkbox component for mobile
 */
const Checkbox = (props: any) => {
  const urlCheckbox = props.value;
  const setUrlCheckbox = props.onValueChange;
  return (
    <CheckBox
      value={urlCheckbox}
      onValueChange={setUrlCheckbox}
      tintColors={{
        true: $config.PRIMARY_COLOR,
        false: $config.PRIMARY_FONT_COLOR + 80,
      }}
      tintColor={$config.PRIMARY_FONT_COLOR + 80}
      onCheckColor={$config.PRIMARY_COLOR}
      onTintColor={$config.PRIMARY_COLOR}
    />
  );
};
export default Checkbox;

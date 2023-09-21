import {ToolbarPreset} from 'customization-api';
import {useCustomWrapper} from '../custom-context/CustomWrapper';
import React from 'react';
import {TouchableOpacity, Text} from 'react-native';

const HideSelfViewButton = () => {
  const {hideSelfView, setHideSelfView} = useCustomWrapper();
  return (
    <TouchableOpacity
      onPress={() => {
        setHideSelfView(!hideSelfView);
      }}>
      <Text style={{color: $config.FONT_COLOR}}>
        {hideSelfView ? 'Show' : 'Hide'} Self View
      </Text>
    </TouchableOpacity>
  );
};

const CustomTopBar = () => {
  return (
    <>
      <ToolbarPreset
        align="top"
        customItems={[
          {
            align: 'end',
            component: HideSelfViewButton,
            hide: 'no',
            order: 0,
          },
        ]}
      />
    </>
  );
};
export default CustomTopBar;

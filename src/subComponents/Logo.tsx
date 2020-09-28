import React, { useContext } from 'react';
import {Image, TouchableOpacity} from 'react-native';
import {useHistory} from '../components/Router';
import colorContext from '../components/ColorContext';

export default function Logo() {
  const history = useHistory();
  const {primaryColor} = useContext(colorContext);

  return (
    <TouchableOpacity onPress={() => history.replace('/')}>
      <Image
        source={{uri: $config.logo}}
        style={{
          width: 90,
          height: 30,
          tintColor: primaryColor,
        }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

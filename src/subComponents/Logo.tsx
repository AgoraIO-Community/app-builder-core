import React from 'react';
import {Image, TouchableOpacity} from 'react-native';
import {useHistory} from '../components/Router';

export default function Logo() {
  const history = useHistory();

  return (
    <TouchableOpacity onPress={() => history.replace('/')}>
      <Image
        source={{uri: $config.logo}}
        style={{
          width: 90,
          height: 30,
        }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

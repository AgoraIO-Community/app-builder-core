import React from 'react';
import {Image, TouchableOpacity, StyleSheet} from 'react-native';
import {useHistory} from '../components/Router';

/**
 * Displays the logo.
 */
export default function Logo() {
  const history = useHistory();

  return (
    <TouchableOpacity onPress={() => history.replace('/')}>
      <Image
        source={{uri: $config.logo}}
        style={styles.logo}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 90,
    height: 30,
  },
});

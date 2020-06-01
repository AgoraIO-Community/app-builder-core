/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {Image, View, TextInput, TouchableOpacity, Text, StyleSheet, StatusBar, Platform} from 'react-native';
import images from './src/images';

const App = () => {
  const [channel, onChangeChannel] = useState(undefined);
  const [password, onChangePassword] = useState(undefined);

  return (
    <View
      style={
        Platform.OS === 'web' ? styles.mainContainerWeb : styles.mainContainer
      }>
      <StatusBar hidden />
      <View style={styles.contentContainer}>
        <Image source={{uri: images.icons}} style={styles.icons} />
        <Image source={{uri: images.logo}} style={styles.logo} />
        <TextInput
          style={styles.textBox}
          value={channel}
          onChangeText={(text) => onChangeChannel(text)}
          placeholder="Channel Name"
          placeholderTextColor="#3DAAF8"
          autoCorrect={false}
        />
        <TextInput
          style={styles.textBox}
          value={password}
          onChangeText={(text) => onChangePassword(text)}
          placeholder="Password (Optional)"
          placeholderTextColor="#3DAAF8"
          secureTextEntry={true}
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Enter</Text>
        </TouchableOpacity>
      </View>
      {Platform.OS === 'web' ? (
        <View style={styles.imageContainer}>
          <Image source={{uri: images.people}} style={styles.hero} />
        </View>
      ) : <></>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#009DEC',
  },
  mainContainerWeb: {
    flex: 1,
    backgroundColor: '#009DEC',
    //backgroundImage: 'linear-gradient(0deg, #0076D6, #02BFFC)',
    flexDirection: 'row',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#ff0000',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: '10%',
    alignItems: 'center',
    paddingTop: '4%',
    marginTop: 80,
  },
  buttonText: {
    width: '100%',
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#fff',
  },
  textBox: {
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#007FD6',
    color: '#fff',
    marginBottom: 15,
    maxWidth: 500,
    minHeight: 40,
  },
  button: {
    width: '100%',
    backgroundColor: '#00C7FE',
    maxWidth: 500,
    minHeight: 40,
  },
  icons: {
    tintColor: '#fff',
    width: 175,
    height: 35,
    alignSelf: 'center',
    margin: 30,
    marginTop: 100,
  },
  logo: {
    tintColor: '#fff',
    width: 177,
    height: 45,
    alignSelf: 'center',
    marginBottom: 40,
  },
  hero: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
  },
});

export default App;

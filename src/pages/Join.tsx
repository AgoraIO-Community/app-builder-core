import React from 'react';
import {
  View,
  TextInput,
  StatusBar,
  TouchableOpacity,
  Text,
  Platform,
  Image,
} from 'react-native';
import images from '../assets/images';
import styles from '../components/styles';
import {useHistory} from '../components/Router';

const Join = (props) => {
  const history = useHistory();
  console.log('history ', history);

  const startCall = () => {
    if (channel !== '') {
      history.push(`/${channel}`);
    }
  };

  const channel = props.channel;
  const onChangeChannel = props.onChangeChannel;
  const password = props.password;
  const onChangePassword = props.onChangePassword;

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
          onSubmitEditing={() => startCall()}
          placeholder="Channel Name"
          placeholderTextColor="#3DAAF8"
          autoCorrect={false}
        />
        <TextInput
          style={styles.textBox}
          value={password}
          onChangeText={(text) => onChangePassword(text)}
          onSubmitEditing={() => startCall()}
          placeholder="Password (Optional)"
          placeholderTextColor="#3DAAF8"
          secureTextEntry={true}
        />
        <TouchableOpacity style={styles.button} onPress={() => startCall()}>
          <Text style={styles.buttonText}>Enter</Text>
        </TouchableOpacity>
      </View>
      {Platform.OS === 'web' ? (
        <View style={styles.imageContainer}>
          <Image source={{uri: images.people}} style={styles.hero} />
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

export default Join;

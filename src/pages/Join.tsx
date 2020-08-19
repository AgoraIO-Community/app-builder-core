import React, {useContext} from 'react';
import {
  View,
  TextInput,
  StatusBar,
  TouchableOpacity,
  Text,
  Image,
  ImageBackground,
} from 'react-native';
import images from '../assets/images';
import styles from '../components/styles';
import {useHistory} from '../components/Router';
import SessionContext from '../components/SessionContext';
import LogoutButton from '../subComponents/LogoutButton';

const joinFlag = 0;
interface joinProps {
  channel: string;
  onChangeChannel: (text: string) => void;
  password: string;
  onChangePassword: (text: string) => void;
}

const Join = (props: joinProps) => {
  const history = useHistory();
  const {joinSession} = useContext(SessionContext);

  const createMeeting = () => {
    history.push('/create');
  };

  const channel = props.channel;
  const onChangeChannel = props.onChangeChannel;
  const password = props.password;
  const onChangePassword = props.onChangePassword;
  const startCall = async () => {
    joinSession({channel, password, joinFlag});
  };
  return (
    <ImageBackground
      source={{uri: images.background}}
      style={styles.full}
      resizeMode={'cover'}>
      <StatusBar hidden />
      <LogoutButton />
      <View style={styles.contentContainer}>
        <Image
          source={{uri: images.icons}}
          style={styles.icons}
          resizeMode={'contain'}
        />
        <Image
          source={{uri: images.logo}}
          style={styles.logo}
          resizeMode={'contain'}
        />
        <TextInput
          style={styles.textBox}
          value={channel}
          onChangeText={(text) => onChangeChannel(text)}
          onSubmitEditing={() => startCall()}
          placeholder="Enter Channel Name"
          placeholderTextColor="#3DAAF8"
          autoCorrect={false}
        />
        <TextInput
          style={styles.textBox}
          value={password}
          onChangeText={(text) => onChangePassword(text)}
          onSubmitEditing={() => startCall()}
          placeholder="Password"
          placeholderTextColor="#3DAAF8"
          secureTextEntry={true}
        />
        <TouchableOpacity style={styles.button} onPress={() => startCall()}>
          <Text style={styles.buttonText}>Enter</Text>
        </TouchableOpacity>
        <View style={styles.hr} />
        <TouchableOpacity style={styles.button} onPress={() => createMeeting()}>
          <Text style={styles.buttonText}>Create a new meeting</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Join;

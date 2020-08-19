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

  const logout = () => {};
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
      <View style={{alignSelf: 'flex-end'}}>
        <TouchableOpacity
          style={{
            backgroundColor: '#099DFD',
            width: 80,
            height: 30,
            marginTop: 5,
            marginRight: 5,
          }}
          onPress={() => logout()}>
          <Text
            style={{
              lineHeight: 30,
              fontSize: 16,
              textAlign: 'center',
              color: '#fff',
            }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
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

import React from 'react';
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
import {gql, useLazyQuery} from '@apollo/client';

interface joinProps {
  channel: string;
  onChangeChannel: (text: string) => void;
  password: string;
  onChangePassword: (text: string) => void;
}

const JOIN_CHANNEL = gql`
  query JoinChannel($channel: String!, $password: String!) {
    joinChannel(channel: $channel, password: $password) {
      channel
      isHost
      rtc
      rtm
      uid
    }
  }
`;

const Join = (props: joinProps) => {
  const history = useHistory();
  const [joinChannel, {data, loading}] = useLazyQuery(JOIN_CHANNEL);

  const createMeeting = () => {
    history.push('/create');
  };

  const channel = props.channel;
  const onChangeChannel = props.onChangeChannel;
  const password = props.password;
  const onChangePassword = props.onChangePassword;
  const startCall = async () => {
    // if (channel !== '') {
    //   history.push(`/${channel}`);
    // }
    let data = await joinChannel({
      variables: {
        channel,
        password,
      },
    });
  };
  return (
    <ImageBackground
      source={{uri: images.background}}
      style={styles.full}
      resizeMode={'cover'}>
      <StatusBar hidden />
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

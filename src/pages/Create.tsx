import React, {useState} from 'react';
import {
  View,
  TextInput,
  StatusBar,
  TouchableOpacity,
  Text,
  ImageBackground,
} from 'react-native';
import Checkbox from '../subComponents/Checkbox';
import images from '../assets/images';
import styles from '../components/styles';
import {useHistory} from '../components/Router';
import {gql, useMutation} from '@apollo/client';

type PasswordInput = {
  host: string;
  view: string;
};

const CREATE_CHANNEL = gql`
  mutation CreateChannel(
    $channel: String!
    $enableLink: Boolean
    $password: PasswordInput
  ) {
    createChannel(
      channel: $channel
      enableLink: $enableLink
      password: $password
    ) {
      password {
        host
        view
      }
      passphrase {
        host
        view
      }
    }
  }
`;
// https://agora-meet.netlify.app/join/khjshbdfkhsdf-sd-fkhsdbfsd
const Create = () => {
  const history = useHistory();
  const [channel, onChangeChannel] = useState('');
  const [attendeePassword, onChangeAttendeePassword] = useState('');
  const [hostPassword, onChangeHostPassword] = useState('');
  const [urlCheckbox, setUrlCheckbox] = useState(true);
  const [passwordCheckbox, setPasswordCheckbox] = useState(false);
  const [urlOne, setUrlOne] = useState('https://meet.agora.io/room=%22test%22');
  const [urlTwo, setUrlTwo] = useState(
    "https://meet.agora.io/room=%22test%22&pass='pass'",
  );
  const [receivedChannel, setReceivedChannel] = useState('test');
  const [password, setPassword] = useState('temppass');
  const [roomCreated, setRoomCreated] = useState(false);
  const [createChannel, {data, loading}] = useMutation(CREATE_CHANNEL);

  console.log('mutation data', data);

  const createRoom = () => {
    if (channel !== '') {
      console.log('Create room invoked');
      createChannel({
        variables: {
          channel,
          enableLink: urlCheckbox,
          password: {host: hostPassword, view: attendeePassword},
        },
      }).then((data) => {
        console.log('promise data', data);
      });
      // setRoomCreated(true);
    }
  };
  const enterMeeting = () => {
    if (channel !== '') {
      history.push(`/${channel}`);
    }
  };

  return (
    <ImageBackground
      source={{uri: images.background}}
      style={styles.full}
      resizeMode={'cover'}>
      <StatusBar hidden />
      {!roomCreated ? (
        <View style={styles.contentContainer}>
          <Text style={styles.headingText}>Create a new Meeting</Text>
          <View style={styles.checkboxHolder}>
            <Text style={styles.subHeadingText}>
              Select methods to join the Meeting:
            </Text>
            <View style={styles.checkboxView}>
              <Text style={styles.paddedText}>URLs </Text>
              <Checkbox value={urlCheckbox} onValueChange={setUrlCheckbox} />
            </View>
            <View style={styles.checkboxView}>
              <Text style={styles.paddedText}>Room name & Password </Text>
              <Checkbox
                value={passwordCheckbox}
                onValueChange={setPasswordCheckbox}
              />
            </View>
          </View>
          <TextInput
            style={styles.textBox}
            value={channel}
            onChangeText={(text) => onChangeChannel(text)}
            onSubmitEditing={() => createRoom()}
            placeholder="Enter Room Name"
            placeholderTextColor="#3DAAF8"
            autoCorrect={false}
          />
          {passwordCheckbox ? (
            <>
              <TextInput
                style={styles.textBox}
                value={hostPassword}
                onChangeText={(text) => onChangeHostPassword(text)}
                onSubmitEditing={() => createRoom()}
                placeholder="Enter Attendee Password"
                placeholderTextColor="#3DAAF8"
                secureTextEntry={true}
                disabled={!passwordCheckbox}
              />
              <TextInput
                style={styles.textBox}
                value={attendeePassword}
                onChangeText={(text) => onChangeAttendeePassword(text)}
                onSubmitEditing={() => createRoom()}
                placeholder="Enter Host Password"
                placeholderTextColor="#3DAAF8"
                secureTextEntry={true}
                disabled={!passwordCheckbox}
              />
            </>
          ) : (
            <></>
          )}
          <TouchableOpacity style={styles.button} onPress={() => createRoom()}>
            <Text style={styles.buttonText}>Create Meeting</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.meetingDetailsContainer}>
          <Text style={styles.headingText}>Meeting Details</Text>
          <Text style={styles.subHeadingText}>Meeting URL:</Text>
          <View style={styles.urlTextView}>
            <Text style={styles.urlText}>{urlOne}</Text>
          </View>
          <Text style={styles.subHeadingText}>Host URL:</Text>
          <View style={styles.urlTextView}>
            <Text style={styles.urlText}>{urlTwo}</Text>
          </View>
          <Text style={styles.subHeadingText}>Room Name:</Text>
          <View style={styles.urlTextView}>
            <Text style={styles.urlText}>{receivedChannel}</Text>
          </View>
          <Text style={styles.subHeadingText}>Password:</Text>
          <View style={styles.urlTextView}>
            <Text style={styles.urlText}>{password}</Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => enterMeeting()}>
            <Text style={styles.buttonText}>Enter Meeting</Text>
          </TouchableOpacity>
        </View>
      )}
    </ImageBackground>
  );
};

export default Create;

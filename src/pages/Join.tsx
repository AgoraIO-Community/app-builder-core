import React, {useContext, useState} from 'react';
import {
  View,
  TextInput,
  StatusBar,
  TouchableOpacity,
  Text,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import images from '../assets/images';
import {useHistory} from '../components/Router';
import SessionContext from '../components/SessionContext';
import OpenInNativeButton from '../subComponents/OpenInNativeButton';
import Logo from '../subComponents/Logo';
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
  const [dim, setDim] = useState([0, 0]);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const createMeeting = () => {
    history.push('/create');
  };

  const channel = props.channel;
  const onChangeChannel = props.onChangeChannel;
  const startCall = async () => {
    joinSession({channel, joinFlag});
  };
  return (
    <ImageBackground
      onLayout={onLayout}
      source={{uri: images.background}}
      style={style.full}
      resizeMode={'cover'}>
      <View style={style.main}>
        <View style={style.nav}>
          <Logo />
          <OpenInNativeButton />
        </View>
        <View style={style.content}>
          <View style={style.leftContent}>
            <Text style={style.heading}>Agora.io</Text>
            <Text style={style.headline}>
              The Real-Time Engagement Platform for meaningful human
              connections.
            </Text>
            <View style={style.inputs}>
              <TextInput
                style={style.textInput}
                value={channel}
                onChangeText={(text) => onChangeChannel(text)}
                onSubmitEditing={() => startCall()}
                placeholder="Meeting ID"
                placeholderTextColor="#777"
              />
              <TouchableOpacity
                style={style.primaryBtn}
                onPress={() => startCall()}>
                <Text style={style.primaryBtnText}>Enter</Text>
              </TouchableOpacity>
              <View style={style.ruler} />
              <TouchableOpacity
                style={style.secondaryBtn}
                onPress={() => createMeeting()}>
                <Text style={style.secondaryBtnText}>Create a meeting</Text>
              </TouchableOpacity>
              <LogoutButton />
            </View>
          </View>
          {dim[0] > dim[1] + 150 ? (
            <View style={style.full}>
              <View style={{flex: 1, backgroundColor: '#00ff00', opacity: 0}} />
            </View>
          ) : (
            <></>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

const style = StyleSheet.create({
  full: {flex: 1},
  main: {
    flex: 2,
    justifyContent: 'space-evenly',
    marginHorizontal: '10%',
  },
  nav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {flex: 6, flexDirection: 'row'},
  leftContent: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-evenly',
    marginVertical: '5%',
    marginRight: '5%',
  },
  heading: {
    fontSize: 40,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  headline: {
    fontSize: 20,
    fontWeight: '400',
    color: '#777',
    marginBottom: 20,
  },
  inputs: {
    flex: 1,
    width: '100%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  textInput: {
    width: '100%',
    paddingLeft: 8,
    borderColor: '#099DFD',
    borderWidth: 2,
    color: '#333',
    fontSize: 16,
    marginBottom: 15,
    maxWidth: 400,
    minHeight: 45,
  },
  primaryBtn: {
    width: '60%',
    backgroundColor: '#099DFD',
    maxWidth: 400,
    minHeight: 45,
  },
  primaryBtnText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#fff',
  },
  ruler: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    width: '100%',
    maxWidth: 200,
  },
  secondaryBtn: {
    width: '60%',
    borderColor: '#099DFD',
    borderWidth: 3,
    maxWidth: 400,
    minHeight: 45,
  },
  secondaryBtnText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    textAlignVertical: 'center',
    color: '#099DFD',
  },
});

export default Join;

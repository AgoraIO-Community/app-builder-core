import React, {useContext, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useHistory} from '../components/Router';
import SessionContext from '../components/SessionContext';
import OpenInNativeButton from '../subComponents/OpenInNativeButton';
import Logo from '../subComponents/Logo';
import LogoutButton from '../subComponents/LogoutButton';
import ColorContext from '../components/ColorContext';
import Illustration from '../subComponents/Illustration';
import {secondaryBtn} from '../../theme.json';
import PrimaryButton from '../atoms/PrimaryButton';
import SecondaryButton from '../atoms/SecondaryButton';
import HorizontalRule from '../atoms/HorizontalRule';
import TextInput from '../atoms/TextInput';
// const joinFlag = 0;
interface joinProps {
  phrase: string;
  onChangePhrase: (text: string) => void;
}
const Join = (props: joinProps) => {
  const history = useHistory();
  const {primaryColor} = useContext(ColorContext);
  const {joinSession} = useContext(SessionContext);
  const [error, setError] = useState(null);
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const createMeeting = () => {
    history.push('/create');
  };

  const phrase = props.phrase;
  const onChangePhrase = props.onChangePhrase;
  const startCall = async () => {
    joinSession({phrase});
  };
  return (
    <ImageBackground
      onLayout={onLayout}
      source={{uri: $config.bg}}
      style={style.full}
      resizeMode={'cover'}>
      <View style={style.main}>
        <View style={style.nav}>
          <Logo />
          {error ? (
            <View
              style={{
                position: 'absolute',
                borderWidth: 2,
                borderColor: '#ff0000',
                backgroundColor: '#ffffff80',
                paddingHorizontal: 10,
                paddingVertical: 2,
                maxWidth: 250,
                width: '65%',
                left: 0,
                right: 0,
                top: '30%',
                marginHorizontal: 'auto',
                zIndex: 55,
              }}>
              <Text style={{alignSelf: 'center'}}>
                <Text
                  style={{
                    fontWeight: '500',
                    textAlign: 'center',
                    fontSize: 16,
                  }}>
                  {error.name + ' - '}
                </Text>
                <Text style={{}}>{error.message}</Text>
              </Text>
            </View>
          ) : (
            <></>
          )}
          {/* <OpenInNativeButton /> */}
        </View>
        <View style={style.content}>
          <View style={style.leftContent}>
            <Text style={style.heading}>{$config.landingHeading}</Text>
            <Text style={style.headline}>{$config.landingSubHeading}</Text>
            <View style={style.inputs}>
              <TextInput
                value={phrase}
                onChangeText={(text) => onChangePhrase(text)}
                onSubmitEditing={() => startCall()}
                placeholder="Meeting ID"
              />

              <PrimaryButton
                disabled={phrase === ''}
                onPress={() => startCall()}
                text={'Enter'}
              />
              <HorizontalRule />
              <SecondaryButton
                onPress={() => createMeeting()}
                text={'Create a meeting'}
              />
              {$config.ENABLE_OAUTH ? (
                <LogoutButton setError={setError} />
              ) : (
                <></>
              )}
            </View>
          </View>
          {dim[0] > dim[1] + 150 ? (
            <View style={style.full}>
              {/* <View style={{flex: 1, backgroundColor: '#00ff00', opacity: 0}} /> */}
              <Illustration />
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
  illustration: {flex: 1, alignSelf: 'flex-end'},
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
    color: '#fff',
    marginBottom: 20,
  },
  headline: {
    fontSize: 20,
    fontWeight: '400',
    color: '#fff',
    marginBottom: 20,
  },
  inputs: {
    flex: 1,
    width: '100%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
});

export default Join;

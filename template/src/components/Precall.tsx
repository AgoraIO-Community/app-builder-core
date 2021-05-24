import React, {useState, useContext} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import TextInput from '../atoms/TextInput';
import PrimaryButton from '../atoms/PrimaryButton';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';
import {MaxVideoView} from '../../agora-rn-uikit/Components';
import {LocalAudioMute, LocalVideoMute} from '../../agora-rn-uikit/Components';
import LocalUserContext from '../../agora-rn-uikit/src/LocalUserContext';
import SelectDevice from '../subComponents/SelectDevice';
import Logo from '../subComponents/Logo';
import OpenInNativeButton from '../subComponents/OpenInNativeButton';
import ColorContext from './ColorContext';
import {useHistory} from './Router';
import {precallCard} from '../../theme.json';
import Error from '../subComponents/Error';

const Precall = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const {setCallActive, queryComplete, username, setUsername, error} = props;
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };

  return (
    // <ImageBackground
    //   onLayout={onLayout}
    //   source={{uri: $config.bg}}
    //   style={style.full}
    //   resizeMode={'cover'}>
      <View style={style.main} onLayout={onLayout}>
        <View style={style.nav}>
          <Logo />
          {error ? <Error error={error} showBack={true} /> : <></>}
          {/* <OpenInNativeButton /> */}
        </View>
        <View style={style.content}>
          <View style={style.leftContent}>
            <MaxUidConsumer>
              {(maxUsers) => (
                <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
              )}
            </MaxUidConsumer>
            <View style={style.precallControls}>
              <LocalUserContext>
                <LocalVideoMute />
                <LocalAudioMute />
              </LocalUserContext>
            </View>
            {dim[0] < dim[1] + 150 ? (
              <View style={[style.margin5Btm, {alignItems: 'center'}]}>
                <TextInput
                  value={username}
                  onChangeText={(text) => {
                    if (username !== 'Getting name...') {
                      setUsername(text);
                    }
                  }}
                  onSubmitEditing={() => {}}
                  placeholder="Display Name"
                />
                <View style={style.margin5Btm} />
                <PrimaryButton
                  onPress={() => setCallActive(true)}
                  disabled={!queryComplete}
                  text={queryComplete ? 'Join Room' : 'Loading...'}
                />
              </View>
            ) : (
              <></>
            )}
          </View>
          {dim[0] >= dim[1] + 150 ? (
            // <View style={[style.full]}>
            <View style={[{shadowColor: primaryColor}, style.precallPickers]}>
              {/* <View style={{flex: 1}}> */}
                <Text
                  style={[style.subHeading, {color: $config.primaryFontColor}]}>
                  Select Input Device
                </Text>
              {/* </View> */}
              <View style={{height: 20}} />
              <View style={{flex: 1}}>
                <SelectDevice />
              </View>
              <View
                style={{
                  flex: 1,
                  width: 350,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 50,
                }}>
                <TextInput
                  value={username}
                  onChangeText={(text) => {
                    if (username !== 'Getting name...') {
                      setUsername(text);
                    }
                  }}
                  onSubmitEditing={() => {}}
                  placeholder="Display Name"
                />
                <View style={{height: 20}} />
                <PrimaryButton
                  onPress={() => setCallActive(true)}
                  disabled={!queryComplete}
                  text={queryComplete ? 'Join Room' : 'Loading...'}
                />
              </View>
            </View>
          ) : (
            // </View>
            <></>
          )}
        </View>
      </View>
    // </ImageBackground>
  );
};

const style = StyleSheet.create({
  full: {flex: 1},
  main: {
    flex: 2,
    justifyContent: 'space-evenly',
    marginHorizontal: '10%',
    minHeight: 500,
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
    flex: 1.3,
    justifyContent: 'space-evenly',
    marginTop: '2.5%',
    // marginBottom: '5%',
    // marginRight: '5%',
  },
  subHeading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
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
    alignSelf: 'center',
  },
  primaryBtn: {
    width: '60%',
    backgroundColor: '#099DFD',
    maxWidth: 400,
    minHeight: 45,
    alignSelf: 'center',
  },
  primaryBtnDisabled: {
    width: '60%',
    backgroundColor: '#099DFD80',
    maxWidth: 400,
    minHeight: 45,
    minWidth: 200,
    alignSelf: 'center',
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
  precallControls: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 10,
    width: '60%',
    justifyContent: 'space-around',
    marginVertical: '5%',
  },
  precallPickers: {
    alignItems: 'center',
    alignSelf: 'center',
    // alignContent: 'space-around',
    justifyContent: 'space-around',
    flex: 1,
    marginBottom: '10%',
    height: '35%',
    minHeight: 280,
  },
  margin5Btm: {marginBottom: '5%'},
});

export default Precall;

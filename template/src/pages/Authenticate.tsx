import React, {useState} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Logo from '../subComponents/Logo';
import OAuth from '../components/OAuth';
import Illustration from '../subComponents/Illustration';

const Authenticate = () => {
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
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
        </View>
        <View style={style.content}>
          <View style={style.leftContent}>
            <Text style={style.heading}>Login using OAuth</Text>
            <Text style={style.headline}>Please select an OAuth provider to login.</Text>
            <OAuth />
          </View>
          {dim[0] > dim[1] + 150 ? (
            <View style={style.full}>
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
    marginRight: '5%',
  },
  heading: {
    fontSize: 40,
    fontWeight: '700',
    color: $config.primaryFontColor,
    marginBottom: 20,
  },
  headline: {
    fontSize: 20,
    letterSpacing: 2,
    fontWeight: '400',
    color: $config.primaryFontColor,
    marginTop: -50,
    marginBottom: 20,
  },
});

export default Authenticate;

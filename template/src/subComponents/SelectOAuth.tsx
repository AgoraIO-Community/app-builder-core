import React, { useContext } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Linking,
  Image,
} from 'react-native';
import ColorContext from '../components/ColorContext';
import google from '../assets/google.png';
import apple from '../assets/apple.png';
import slack from '../assets/slack.png';
import microsoft from '../assets/microsoft.png';


const SelectOAuth = ({ onSelectOAuth }) => {
  // Linking.openURL(url);
  const {primaryColor,} = useContext(ColorContext);
  return  <View style={style.inputs} >
    <TouchableOpacity
      style={[style.secondaryBtn, {borderColor: primaryColor}]}
      onPress={() => onSelectOAuth({ oAuthSystemType: 'google'})}>
      <Image source={google} style={style.logo}/>
      <Text style={[style.secondaryBtnText]}>
        Google
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[style.secondaryBtn, {borderColor: primaryColor}]}
      onPress={() => onSelectOAuth({ oAuthSystemType: 'microsoft'})}>
      <Image source={microsoft} style={style.logo}/>
      <Text style={[style.secondaryBtnText]}>
        Microsoft
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[style.secondaryBtn, {borderColor: primaryColor}]}
      onPress={() => onSelectOAuth({ oAuthSystemType: 'slack'})}>
        <Image source={slack} style={style.logo}/>
      <Text style={[style.secondaryBtnText]}>
        Slack
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[style.secondaryBtn, {borderColor: primaryColor}]}
      onPress={() => onSelectOAuth({ oAuthSystemType: 'apple'})}>
        <Image source={apple} style={style.logo}/>
      <Text style={[style.secondaryBtnText]}>
        Apple
      </Text>
    </TouchableOpacity>
  </View>
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
    display:'flex',
    flexDirection: 'row',
    flexBasis: '33.333333%',
    alignItems: 'center',
    flexWrap:'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    marginBottom: 200,
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
  primaryBtnDisabled: {
    width: '60%',
    backgroundColor: '#099DFD80',
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
    borderColor: '#099DFD',
    borderWidth: 3,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    alignContent: 'space-around',
    paddingTop: 20,
    paddingHorizontal: 30,
    margin: 10,
  },
  secondaryBtnText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    textAlignVertical: 'center',
  },
  logo: {
      width: 80,
      height: 80,
  }
});
export default SelectOAuth;

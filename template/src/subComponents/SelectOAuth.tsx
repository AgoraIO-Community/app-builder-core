import React, { useContext } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
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
  return  <View style={style.oAuthContainer} >
    <TouchableOpacity
      style={[style.secondaryBtn, {borderColor: primaryColor}]}
      onPress={() => onSelectOAuth({ oAuthSystem: 'google'})}>
      <Image source={google} style={style.logo}/>
      <Text style={[style.secondaryBtnText]}>
        Google
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[style.secondaryBtn, {borderColor: primaryColor}]}
      onPress={() => onSelectOAuth({ oAuthSystem: 'microsoft'})}>
      <Image source={microsoft} style={style.logo}/>
      <Text style={[style.secondaryBtnText]}>
        Microsoft
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[style.secondaryBtn, {borderColor: primaryColor}]}
      onPress={() => onSelectOAuth({ oAuthSystem: 'slack'})}>
        <Image source={slack} style={style.logo}/>
      <Text style={[style.secondaryBtnText]}>
        Slack
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[style.secondaryBtn, {borderColor: primaryColor}]}
      onPress={() => onSelectOAuth({ oAuthSystem: 'apple'})}>
        <Image source={apple} style={style.logo}/>
      <Text style={[style.secondaryBtnText]}>
        Apple
      </Text>
    </TouchableOpacity>
  </View>
};
const style = StyleSheet.create({
  oAuthContainer: {
    display:'flex',
    flexDirection: 'row',
    flexBasis: '33.333333%',
    alignItems: 'center',
    flexWrap:'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    marginBottom: 200,
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

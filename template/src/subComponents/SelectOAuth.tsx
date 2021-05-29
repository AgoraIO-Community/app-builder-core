import React, {useContext} from 'react';
import {View, TouchableOpacity, Text, StyleSheet, Image} from 'react-native';
import ColorContext from '../components/ColorContext';
import google from '../assets/google.png';
import apple from '../assets/apple.png';
import slack from '../assets/slack.png';
import microsoft from '../assets/microsoft.png';
import Logo from './Logo';

const SelectOAuth = ({onSelectOAuth}) => {
  // Linking.openURL(url);
  const {primaryColor} = useContext(ColorContext);
  return (
    <View style={style.main}>
      <View style={style.nav}>
        <Logo />
      </View>
      <View style={style.content}>
        <View style={style.leftContent}>
          <Text style={style.heading}>{$config.landingHeading}</Text>
          <Text style={style.headline}>{$config.landingSubHeading}</Text>
          <View style={style.inputs}>
            <View style={style.oAuthContainer}>
              <Text style={{fontSize: 16, fontWeight: '500', marginBottom: 20,}}>Login using OAuth</Text>
              <TouchableOpacity
                style={[style.secondaryBtn, {borderColor: primaryColor}]}
                onPress={() => onSelectOAuth({oAuthSystem: 'google'})}>
                <Image source={google} style={style.logo} />
                <Text style={[style.secondaryBtnText]}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[style.secondaryBtn, {borderColor: primaryColor}]}
                onPress={() => onSelectOAuth({oAuthSystem: 'microsoft'})}>
                <Image source={microsoft} style={style.logo} />
                <Text style={[style.secondaryBtnText]}>Microsoft</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[style.secondaryBtn, {borderColor: primaryColor}]}
                onPress={() => onSelectOAuth({oAuthSystem: 'slack'})}>
                <Image source={slack} style={style.logo} />
                <Text style={[style.secondaryBtnText]}>Slack</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[style.secondaryBtn, {borderColor: primaryColor}]}
                onPress={() => onSelectOAuth({oAuthSystem: 'apple'})}>
                <Image source={apple} style={style.logo} />
                <Text style={[style.secondaryBtnText]}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  oAuthContainer: {
    display: 'flex',
    flexDirection: 'column',
    // flexBasis: '33.333333%',
    alignItems: 'center',
    alignSelf: 'center',
    margin: 'auto',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    // marginBottom: 200,
  },
  secondaryBtn: {
    minWidth: 200,
    borderColor: $config.primaryColor,
    borderWidth: 1,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'space-around',
    // paddingTop: 20,
    backgroundColor: $config.secondaryFontColor,
    paddingHorizontal: 30,
    margin: 10,
    borderRadius: 100,
  },
  secondaryBtnText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 16,
    color: $config.primaryColor,
    textAlign: 'center',
    fontWeight: '500',
    textAlignVertical: 'center',
  },
  logo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  full: {flex: 1},
  main: {
    flex: 2,
    justifyContent: 'space-evenly',
    marginHorizontal: '8%',
    marginVertical: '2%',
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
    marginBottom: '13%',
    marginTop: '8%',
    // marginRight: '5%',
    marginHorizontal: 'auto',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: $config.primaryFontColor,
    marginBottom: 20,
  },
  headline: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    color: $config.primaryFontColor,
    marginBottom: 20,
  },
  inputs: {
    flex: 1,
    // marginVertical: '2%',
    width: '100%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  // textInput: textInput,
  checkboxHolder: {
    marginVertical: 0,
    flexDirection: 'row',
    marginTop: 0,
    marginBottom: 20,
    // flex: .2,
    // height: 10,
    // justifyContent: 'center',
    // alignContent: 'center',
    justifyContent: 'flex-start',
    // alignItems: 'flex-start',
  },
  checkboxTitle: {
    color: $config.primaryFontColor + 80,
    paddingHorizontal: 5,
    alignSelf: 'center',
    // marginVertical: 'auto',
    // fontWeight: '700',
  },
  checkboxCaption: {color: $config.primaryFontColor + 80, paddingHorizontal: 5},
  checkboxTextHolder: {
    marginVertical: 0, //check if 5
    flexDirection: 'column',
  },
  // urlTitle: {
  //   color: '#fff',
  //   fontSize: 14,
  // },
  urlHolder: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: 'center',
    maxWidth: 400,
    minHeight: 45,
  },
  // url: {
  //   color: '#fff',
  //   fontSize: 18,
  //   fontWeight: '700',
  //   textDecorationLine: 'underline',
  // },
  pstnHolder: {
    flexDirection: 'row',
    width: '80%',
  },
  pstnMargin: {
    marginRight: '10%',
  },
});
export default SelectOAuth;

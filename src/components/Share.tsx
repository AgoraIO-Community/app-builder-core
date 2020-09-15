import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';

const Share = (props: any) => {
  const {urlView, urlHost, pstn, pstnPin} = props;

  const enterMeeting = () => {
    // if (channel !== '') {
    //   history.push('/join');
    // }
  };

  const [dim, setDim] = useState([0, 0]);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };

  return (
    <View style={style.content} onLayout={onLayout}>
      <View style={style.leftContent}>
        <Text style={style.heading}>Meeting Created</Text>
        <Text style={style.urlTitle}>URL for Attendee:</Text>
        <View style={style.urlHolder}>
          <Text style={style.url}>{urlView}</Text>
        </View>
        <Text style={style.urlTitle}>URL for Host:</Text>
        <View style={style.urlHolder}>
          <Text style={style.url}>{urlHost}</Text>
        </View>
        {pstn ? (
          <View style={style.pstnHolder}>
            <View style={style.pstnMargin}>
              <Text style={style.urlTitle}>PSTN:</Text>
              <View style={style.urlHolder}>
                <Text style={style.url}>{pstn}</Text>
              </View>
            </View>
            <View>
              <Text style={style.urlTitle}>Pin:</Text>
              <View style={style.urlHolder}>
                <Text style={style.url}>{pstnPin}</Text>
              </View>
            </View>
          </View>
        ) : (
          <></>
        )}
        <TouchableOpacity
          style={style.secondaryBtn}
          onPress={() => enterMeeting()}>
          <Text style={style.secondaryBtnText}>Copy to clipboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={style.primaryBtn}
          onPress={() => enterMeeting()}>
          <Text style={style.primaryBtnText}>Enter Meeting</Text>
        </TouchableOpacity>
      </View>
      {dim[0] > dim[1] + 150 ? (
        <View style={style.full}>
          <View style={{flex: 1, backgroundColor: '#00ff00', opacity: 0}} />
        </View>
      ) : (
        <></>
      )}
    </View>
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
    marginBottom: '5%',
    marginRight: '5%',
    marginHorizontal: 'auto',
  },
  heading: {
    fontSize: 38,
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
    minWidth: 200,
    minHeight: 45,
  },
  primaryBtnDisabled: {
    width: '60%',
    backgroundColor: '#96D7FE',
    maxWidth: 400,
    minHeight: 45,
    minWidth: 200,
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
  secondaryBtn: {
    width: '60%',
    borderColor: '#099DFD',
    borderWidth: 3,
    maxWidth: 400,
    minHeight: 45,
    minWidth: 200,
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
  checkboxHolder: {
    marginVertical: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTitle: {
    color: '#333',
    paddingHorizontal: 5,
    fontWeight: '700',
  },
  checkboxCaption: {color: '#333', paddingHorizontal: 5},
  checkboxTextHolder: {
    marginVertical: 0, //check if 5
    flexDirection: 'column',
  },
  urlTitle: {
    color: '#333',
    fontSize: 14,
  },
  urlHolder: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: 'center',
    maxWidth: 400,
    minHeight: 45,
  },
  url: {
    color: '#333',
    fontSize: 18,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  pstnHolder: {
    flexDirection: 'row',
    width: '80%',
  },
  pstnMargin: {
    marginRight: '10%',
  },
});

export default Share;

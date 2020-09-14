import React, {useContext} from 'react';
import {View, TouchableOpacity, Image, Text, Platform} from 'react-native';
import {MinUidConsumer} from '../../agora-rn-uikit/src/MinUidContext';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import icons from '../assets/icons';
import Settings from '../components/Settings';

const {
  participantIcon,
  gridLayoutIcon,
  pinnedLayoutIcon,
  recordingIcon,
} = icons;

const Navbar = (props) => {
  // const {rtcProps} = useContext(PropsContext);
  const {
    participantsView,
    setParticipantsView,
    layout,
    setLayout,
    recordingActive,
    setChatDisplayed,
    chatDisplayed,
    isHost,
  } = props;

  return (
    <View
      style={{
        position: 'absolute',
        zIndex: 5,
        width: '20%', //recordingActive? '20%' : '15%',
        height: '8%',
        minHeight: 20,
        minWidth: 200,
        maxWidth: 400,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      {recordingActive ? (
        <View
          style={{
            backgroundColor: '#099DFD',
            flex: 0.25,
            // maxWidth: 150,
            // paddingHorizontal: 2,
            height: 35,
            maxHeight: 30,
            alignSelf: 'center',
            // marginVertical: 'auto',
            flexDirection: 'row',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            borderRadius: 3,
            // marginHorizontal: 5,
          }}>
          <Image
            source={{uri: recordingIcon}}
            style={{
              width: 20,
              height: 20,
              margin: 1,
              resizeMode: 'contain',
            }}
          />
          {/* <Text
              style={{
                fontSize: Platform.OS === 'web' ? 16 : 12,
                color: '#fff',
                fontWeight: '400',
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
              }}>
              Recording
            </Text> */}
        </View>
      ) : (
        <></>
      )}
      <View
        style={{
          backgroundColor: '#fff',
          flex: 0.5,
          maxWidth: 65,
          paddingHorizontal: 5,
          // marginHorizontal: 5,
          height: 35,
          maxHeight: 30,
          // alignSelf: 'center',
          borderColor: '#099DFD',
          borderWidth: 2,
          flexDirection: 'row',
          alignItems: 'center',
          alignContent: 'center',
          borderRadius: 3,
        }}>
        <TouchableOpacity
          onPress={() => {
            chatDisplayed
              ? (setChatDisplayed(false), setParticipantsView(true))
              : setParticipantsView(!participantsView);
          }}
          style={{
            height: '80%',
            width: 40,
            flexDirection: 'row',
            alignContent: 'center',
            justifyContent: 'center',
            flex: 1,
          }}>
          <Image
            source={{uri: participantIcon}}
            style={{
              flex: 1,
              // width: 10,
              margin: 1,
              tintColor: '#099DFD',
              resizeMode: 'contain',
            }}
          />
          <MinUidConsumer>
            {(minUsers) => (
              <Text
                style={{
                  fontSize: Platform.OS === 'web' ? 20 : 18,
                  color: '#099DFD',
                  fontWeight: '400',
                  alignSelf: 'center',
                  textAlign: 'center',
                  flex: 1,
                }}>
                {minUsers.length + 1}
              </Text>
            )}
          </MinUidConsumer>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.roomNameContainer}>
        <Text style={styles.roomNameText}>Room: {rtcProps.channel}</Text>
      </View> */}
      <View
        style={{
          // width: 20,
          height: '100%',
          flexDirection: 'row',
          // marginLeft: 'auto',
          // marginRight: 1,
        }}>
        <TouchableOpacity
          onPress={() => {
            setLayout(!layout);
          }}
          style={{
            height: '90%',
            alignSelf: 'center',
            width: 40,
            // marginRight: 5,
          }}>
          <Image
            source={{uri: layout ? gridLayoutIcon : pinnedLayoutIcon}}
            style={{
              flex: 1,
              // margin: 1,
              resizeMode: 'contain',
              tintColor: '#099DFD',
            }}
          />
        </TouchableOpacity>
      </View>
      {Platform.OS === 'web' ? <Settings isHost={isHost} /> : <></>}
    </View>
  );
};

export default Navbar;

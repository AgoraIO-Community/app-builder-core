import React, {useContext, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
// import {MinUidConsumer} from '../../agora-rn-uikit/src/MinUidContext';
// import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import icons from '../assets/icons';
import Settings from './Settings';
import ColorContext from './ColorContext';
import CopyJoinInfo from '../subComponents/CopyJoinInfo';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {navHolder} from '../../theme.json';

const {participantIcon, gridLayoutIcon, pinnedLayoutIcon, recordingIcon} =
  icons;

const Navbar = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  // const {rtcProps} = useContext(PropsContext);
  const {
    // participantsView,
    // setParticipantsView,
    sidePanel,
    setSidePanel,
    layout,
    setLayout,
    // setChatDisplayed,
    // chatDisplayed,
    isHost,
    title,
  } = props;
  // const [dim, setDim] = useState([
  //   Dimensions.get('window').width,
  //   Dimensions.get('window').height,
  //   Dimensions.get('window').width > Dimensions.get('window').height,
  // ]);
  // let onLayout = (e: any) => {
  //   setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  // };
  return (
    <View
      // onLayout={onLayout}
      style={Platform.OS === 'web' ? style.navHolder : style.navHolderNative}>
      <View style={style.roomNameContainer}>
        {Platform.OS === 'web' ? (
          <View
            style={{flexDirection: 'row', transform: [{translateX: '50%'}]}}>
            <Text style={style.roomNameText}>{title}</Text>
            <View
              style={{
                backgroundColor: $config.primaryFontColor + '80',
                width: 1,
                height: 'auto',
                marginHorizontal: 10,
              }}
            />
            <CopyJoinInfo />
          </View>
        ) : (
          <Text style={style.roomNameText}>{title}</Text>
        )}
      </View>
      {/* {recordingActive ? (
        <View style={[style.recordingView, {backgroundColor: primaryColor}]}>
          <Image source={{uri: recordingIcon}} style={style.recordingIcon} />
          <Text
              style={{
                fontSize: Platform.OS === 'web' ? 16 : 12,
                color: '#fff',
                fontWeight: '400',
                alignSelf: 'center',
                textAlign: 'center',
                flex: 1,
              }}>
              Recording
            </Text>
        </View>
      ) : (
        <></>
      )} */}
      <View
        style={{
          width: '50%',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          zIndex: 9,
          minWidth: Platform.OS === 'web' ? 400 : 40,
          // backgroundColor: '#f00',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            padding: 4,
            // backgroundColor: '#f0f',
            paddingHorizontal: 16,
            borderRadius: 10,
            // borderTopLeftRadius: 10,
            // borderBottomLeftRadius: 10,
            justifyContent: 'space-evenly',
          }}>
          <View>
            <TouchableOpacity
              onPress={() => {
                sidePanel === SidePanelType.Participants
                  ? setSidePanel(SidePanelType.None)
                  : setSidePanel(SidePanelType.Participants);
              }}
              style={style.btnHolder}>
              <Image
                source={{uri: participantIcon}}
                style={[style.participantBtnIcon, {tintColor: primaryColor}]}
              />
              {/* <MinUidConsumer>
                {(minUsers) => (
                  <Text style={[style.participantText, {color: primaryColor}]}>
                    {minUsers.length + 1}
                  </Text>
                )}
              </MinUidConsumer> */}
            </TouchableOpacity>
          </View>
          {Platform.OS === 'web' && (
            <View
              style={{
                backgroundColor: $config.primaryFontColor + '80',
                width: 1,
                height: '100%',
                marginHorizontal: 20,
                alignSelf: 'center',
                opacity: 0.8,
              }}
            />
          )}
          <View>
            <View style={{alignSelf: 'center'}}>
              <TouchableOpacity
                style={style.btnHolder}
                onPress={() => {
                  sidePanel === SidePanelType.Chat
                    ? setSidePanel(SidePanelType.None)
                    : setSidePanel(SidePanelType.Chat);
                }}>
                <Image
                  source={{uri: icons.chatIcon}}
                  style={[
                    {
                      width: 35,
                      height: 35,
                      tintColor: $config.primaryColor,
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
          {Platform.OS === 'web' && (
            <View
              style={{
                backgroundColor: $config.primaryFontColor + '80',
                width: 1,
                height: '100%',
                marginHorizontal: 20,
                alignSelf: 'center',
                opacity: 0.8,
              }}
            />
          )}
          <View>
            <View style={{alignSelf: 'center'}}>
              <TouchableOpacity
                style={style.btnHolder}
                onPress={() => {
                  setLayout(!layout);
                }}>
                <Image
                  // source={{uri: layout ? gridLayoutIcon : pinnedLayoutIcon}}
                  source={{uri: gridLayoutIcon}}
                  style={[
                    {
                      width: 30,
                      height: 30,
                      tintColor: $config.primaryColor,
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
          {Platform.OS === 'web' ? (
            <>
              <View
                style={{
                  backgroundColor: $config.primaryFontColor + '80',
                  width: 1,
                  height: '100%',
                  marginHorizontal: 20,
                  alignSelf: 'center',
                  opacity: 0.8,
                }}
              />
              <Settings
                sidePanel={sidePanel}
                setSidePanel={setSidePanel}
                isHost={isHost}
              />
            </>
          ) : (
            <></>
          )}
        </View>
      </View>
    </View>
  );
};
const style = StyleSheet.create({
  navHolder: navHolder,
  navHolderNative: {
    position: 'relative',
    width: '100%',
    height: '8%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    // marginHorizontal: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  // recordingView: {
  //   backgroundColor: $config.primaryColor,
  //   flex: 0.25,
  //   // maxWidth: 150,
  //   // paddingHorizontal: 2,
  //   height: 35,
  //   maxHeight: 30,
  //   alignSelf: 'center',
  //   // marginVertical: 'auto',
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   alignContent: 'center',
  //   justifyContent: 'center',
  //   borderRadius: 3,
  //   // marginHorizontal: 5,
  // },
  // recordingIcon: {
  //   width: 20,
  //   height: 20,
  //   margin: 1,
  //   resizeMode: 'contain',
  // },
  btnHolder: {padding: 5},
  // participantBtnHolder: {
  //   backgroundColor: '#fff',
  //   // flex: 0.5,
  //   width: 90,
  //   paddingHorizontal: 5,
  //   // marginHorizontal: 5,
  //   height: 30,
  //   alignSelf: 'center',
  //   // backgroundColor: $config.primaryColor,
  //   // borderWidth: 2,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   alignContent: 'center',
  //   borderRadius: 3,
  // },
  // participantBtn: {
  //   height: '100%',
  //   // width: '100%',
  //   flexDirection: 'row',
  //   alignContent: 'center',
  //   justifyContent: 'center',
  //   alignSelf: 'center',
  //   flex: 1,
  // },
  participantBtnIcon: {
    height: 30,
    width: 38,
    // margin: 1,
    tintColor: $config.primaryColor,
    resizeMode: 'contain',
  },
  // participantText: {
  //   fontSize: Platform.OS === 'web' ? 20 : 18,
  //   color: $config.primaryColor,
  //   fontWeight: '400',
  //   alignSelf: 'center',
  //   textAlign: 'center',
  //   flex: 1,
  // },
  roomNameContainer: {
    paddingHorizontal: 1,
    marginHorizontal: 1,
    height: 35,
    maxHeight: 30,
    flexDirection: 'row',
    // width: '20%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 10,
  },
  roomNameText: {
    fontSize: 20,
    // flex: 10,
    // width: 50,
    // color: '#fff',
    color: $config.primaryFontColor,
    fontWeight: '500',
  },
  // layoutBtnHolder: {
  //   width: 30,
  //   height: 30,
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   // marginLeft: 'auto',
  //   // marginRight: 1,
  // },
  // layoutBtn: {
  //   height: 30,
  //   alignSelf: 'center',
  //   width: 30,
  //   // marginRight: 5,
  // },
  // localButton: {
  //   // backgroundColor: '#f0f',
  //   height: 30,
  //   alignSelf: 'center',
  //   width: 30,
  //   // marginRight: 5,
  // },
  // layoutBtnIcon: {
  //   flex: 1,
  //   height: 30,
  //   alignSelf: 'center',
  //   width: 30,
  //   resizeMode: 'contain',
  //   tintColor: $config.primaryColor,
  // },
});

export default Navbar;

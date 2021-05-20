import React, {useContext} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  Platform,
  StyleSheet,
} from 'react-native';
import {MinUidConsumer} from '../../agora-rn-uikit/src/MinUidContext';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import icons from '../assets/icons';
import Settings from './Settings';
import ColorContext from './ColorContext';
import CopyJoinInfo from '../subComponents/CopyJoinInfo';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {navHolder} from '../../theme.json';

const {
  participantIcon,
  gridLayoutIcon,
  pinnedLayoutIcon,
  recordingIcon,
} = icons;

const Navbar = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const {rtcProps} = useContext(PropsContext);
  const {
    // participantsView,
    // setParticipantsView,
    sidePanel,
    setSidePanel,
    layout,
    setLayout,
    recordingActive,
    // setChatDisplayed,
    // chatDisplayed,
    isHost,
    title,
  } = props;

  return (
    <View
      style={Platform.OS === 'web' ? style.navHolder : style.navHolderNative}>
      <View style={style.roomNameContainer}>
        {Platform.OS === 'web' ? (
          <View
            style={{flexDirection: 'row', transform: [{translateX: '50%'}]}}>
            <Text style={style.roomNameText}>{title}</Text>
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
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            padding: 10,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            justifyContent: 'space-evenly',
          }}>
          <View
            style={[style.participantBtnHolder, {borderColor: primaryColor}]}>
            <TouchableOpacity
              onPress={() => {
                sidePanel === SidePanelType.Participants
                  ? setSidePanel(SidePanelType.None)
                  : setSidePanel(SidePanelType.Participants);
              }}
              style={style.participantBtn}>
              <Image
                source={{uri: participantIcon}}
                style={[style.participantBtnIcon, {tintColor: primaryColor}]}
              />
              <MinUidConsumer>
                {(minUsers) => (
                  <Text style={[style.participantText, {color: primaryColor}]}>
                    {minUsers.length + 1}
                  </Text>
                )}
              </MinUidConsumer>
            </TouchableOpacity>
          </View>
          <View style={style.layoutBtnHolder}>
            <TouchableOpacity
              onPress={() => {
                setLayout(!layout);
              }}
              style={style.layoutBtn}>
              <Image
                source={{uri: layout ? gridLayoutIcon : pinnedLayoutIcon}}
                style={[style.layoutBtnIcon, {tintColor: primaryColor}]}
              />
            </TouchableOpacity>
          </View>
          {Platform.OS === 'web' ? (
            <Settings
              sidePanel={sidePanel}
              setSidePanel={setSidePanel}
              isHost={isHost}
            />
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
    justifyContent: 'space-around',
  },
  recordingView: {
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
  },
  recordingIcon: {
    width: 20,
    height: 20,
    margin: 1,
    resizeMode: 'contain',
  },
  participantBtnHolder: {
    backgroundColor: '#fff',
    flex: 0.5,
    width: 90,
    paddingHorizontal: 5,
    // marginHorizontal: 5,
    height: 30,
    // alignSelf: 'center',
    borderColor: '#099DFD',
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    borderRadius: 3,
  },
  participantBtn: {
    height: '80%',
    width: '100%',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  participantBtnIcon: {
    height: 20,
    width: 20,
    margin: 1,
    tintColor: '#099DFD',
    resizeMode: 'contain',
  },
  participantText: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    color: '#099DFD',
    fontWeight: '400',
    alignSelf: 'center',
    textAlign: 'center',
    flex: 1,
  },
  roomNameContainer: {
    paddingHorizontal: 1,
    marginHorizontal: 1,
    height: 35,
    maxHeight: 30,
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 10,
  },
  roomNameText: {
    fontSize: 20,
    // flex: 10,
    // width: 50,
    color: '#fff',
    fontWeight: '500',
  },
  layoutBtnHolder: {
    width: 30,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    // marginLeft: 'auto',
    // marginRight: 1,
  },
  layoutBtn: {
    height: 20,
    alignSelf: 'center',
    width: 20,
    // marginRight: 5,
  },
  layoutBtnIcon: {
    flex: 1,
    resizeMode: 'contain',
    tintColor: '#099DFD',
  },
});
export default Navbar;

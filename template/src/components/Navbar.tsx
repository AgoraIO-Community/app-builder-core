/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
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
import Layout from '../subComponents/LayoutEnum';
import ChatContext from '../components/ChatContext';

const {participantIcon, gridLayoutIcon, pinnedLayoutIcon, recordingIcon} =
  icons;

const Navbar = (props: any) => {
  const {primaryColor} = useContext(ColorContext);
  const {messageStore} = useContext(ChatContext);
  const {
    // participantsView,
    // setParticipantsView,
    recordingActive,
    sidePanel,
    setSidePanel,
    layout,
    setLayout,
    pendingMessageLength,
    setLastCheckedPublicState,
    // setChatDisplayed,
    // chatDisplayed,
    isHost,
    title,
  } = props;
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const isDesktop = dim[0] > 1224;
  const mobileAndTabletCheck = () => {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator?.userAgent||navigator?.vendor||window?.opera);
    return check;
  }
  return (
    <View
      onLayout={onLayout}
      style={[Platform.OS === 'web' ? style.navHolder : style.navHolderNative, {backgroundColor: $config.SECONDARY_FONT_COLOR + 80}]}>
      {recordingActive && !mobileAndTabletCheck() ? (
        <View style={[style.recordingView, {backgroundColor: $config.SECONDARY_FONT_COLOR}]}>
          <Image source={{uri: icons.recordingActiveIcon}} style={{
            width: 20,
            height: 20,
            margin: 1,
            resizeMode: 'contain', tintColor: '#FD0845'}} />
          <Text
              style={{
                fontSize: Platform.OS === 'web' ? 16 : 12,
                color: '#FD0845',
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
      )}
      <View style={style.roomNameContainer}>
        {Platform.OS === 'web' ? (
          <View
            style={{flexDirection: 'row', transform: [{translateX: '50%'}]}}>
            <Text style={style.roomNameText}>{title}</Text>
            <View
              style={{
                backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
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
      <View
        style={{
          width: '50%',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          zIndex: 9,
          minWidth: Platform.OS === 'web' ? (isDesktop ? 400 : 280) : 40,
          // backgroundColor: '#f00',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor:
              Platform.OS === 'web'
                ? $config.SECONDARY_FONT_COLOR
                : $config.SECONDARY_FONT_COLOR + '00',
            padding: 4,
            minHeight: 35,
            // height: 40,
            // backgroundColor: '#f0f',
            // paddingHorizontal: 16,
            borderRadius: 10,
            minWidth: Platform.OS === 'web' && isDesktop ? 300 : 200,
            // borderTopLeftRadius: 10,
            // borderBottomLeftRadius: 10,
            justifyContent: 'space-evenly',
          }}>
          <View style={{width: '20%', height: '100%'}}>
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
          {$config.CHAT ? (
            <>
              {Platform.OS === 'web' && isDesktop ? (
                <View
                  style={{
                    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
                    width: 1,
                    height: '100%',
                    marginHorizontal: 10,
                    alignSelf: 'center',
                    opacity: 0.8,
                  }}
                />
              ) : (
                <></>
              )}
              <View style={{width: '25%', height: '120%'}}>
                <View
                  style={{alignSelf: 'center', width: '100%', height: '110%'}}>
                  <TouchableOpacity
                    style={style.btnHolder}
                    onPress={() => {
                      setLastCheckedPublicState(messageStore.length);
                      sidePanel === SidePanelType.Chat
                        ? setSidePanel(SidePanelType.None)
                        : setSidePanel(SidePanelType.Chat);
                    }}>
                    {sidePanel !== SidePanelType.Chat &&
                      pendingMessageLength !== 0 ? (
                      <View style={style.chatNotification}>
                        {pendingMessageLength}
                      </View>
                    ) : (
                      <></>
                    )}
                    <Image
                      source={{
                        uri: sidePanel !== SidePanelType.Chat &&
                          pendingMessageLength !== 0 ? icons.chatIconFilled : icons.chatIcon
                      }}
                      resizeMode={'contain'}
                      style={[
                        {
                          width: '100%',
                          height: '100%',
                          tintColor: $config.PRIMARY_COLOR,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <></>
          )}
          {Platform.OS === 'web' && isDesktop ? (
            <View
              style={{
                backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
                width: 1,
                height: '100%',
                marginHorizontal: 10,
                alignSelf: 'center',
                opacity: 0.8,
              }}
            />
          ) : (
            <></>
          )}
          <View style={{width: '18%', height: '105%'}}>
            <View style={{alignSelf: 'center', width: '100%', height: '105%'}}>
              <TouchableOpacity
                style={style.btnHolder}
                onPress={() => {
                  setLayout((l: Layout) =>
                    l === Layout.Pinned ? Layout.Grid : Layout.Pinned,
                  );
                }}>
                <Image
                  // source={{uri: layout ? gridLayoutIcon : pinnedLayoutIcon}}
                  source={{uri: gridLayoutIcon}}
                  resizeMode={'contain'}
                  style={{
                    width: '100%',
                    height: '100%',
                    tintColor: $config.PRIMARY_COLOR,
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
          {Platform.OS === 'web' && isDesktop ? (
            <>
              <View
                style={{
                  backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
                  width: 1,
                  height: '100%',
                  marginHorizontal: 10,
                  alignSelf: 'center',
                  opacity: 0.8,
                }}
              />
              <View style={{width: '20%', height: '100%'}}>
                <Settings
                  sidePanel={sidePanel}
                  setSidePanel={setSidePanel}
                  isHost={isHost}
                />
              </View>
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
    backgroundColor: $config.SECONDARY_FONT_COLOR + '80',
    flexDirection: 'row',
    alignItems: 'center',
    // marginHorizontal: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  recordingView: {
    // flex: 0.25,
    // maxWidth: 150,
    // paddingHorizontal: 2,
    height: 35,
    maxHeight: 30,
    position: 'absolute',
    left: 10,
    // alignSelf: 'center',
    paddingHorizontal: 5,
    // marginVertical: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    // marginHorizontal: 5,
  },
  recordingIcon: {
    width: 20,
    height: 20,
    margin: 1,
    resizeMode: 'contain',
  },
  btnHolder: {padding: 5, width: '100%', height: '100%'},
  // participantBtnHolder: {
  //   backgroundColor: '#fff',
  //   // flex: 0.5,
  //   width: 90,
  //   paddingHorizontal: 5,
  //   // marginHorizontal: 5,
  //   height: 30,
  //   alignSelf: 'center',
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
    height: '100%',
    width: '100%',
    // margin: 1,
    tintColor: $config.PRIMARY_COLOR,
    resizeMode: 'contain',
  },
  // participantText: {
  //   fontSize: Platform.OS === 'web' ? 20 : 18,
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
    color: $config.PRIMARY_FONT_COLOR,
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
  // },
  chatNotification: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: $config.PRIMARY_COLOR,
    color: $config.SECONDARY_FONT_COLOR,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
    borderRadius: 10,
    position: 'absolute',
    left: 20,
    top: -8,
  },
});

export default Navbar;

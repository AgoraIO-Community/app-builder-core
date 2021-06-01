import React, {useContext, useEffect, useRef} from 'react';
import {Image, TouchableOpacity, StyleSheet} from 'react-native';
import chatContext from '../components/ChatContext';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import icons from '../assets/icons';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import ColorContext from '../components/ColorContext';
import MinUidContext from '../../agora-rn-uikit/src/MinUidContext';
import MaxUidContext from '../../agora-rn-uikit/src/MaxUidContext';
import Layout from '../subComponents/LayoutEnum';


interface ScreenSharingProps {
  screenshareActive: boolean;
  setScreenshareActive: React.Dispatch<React.SetStateAction<boolean>>;
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
/**
 * A component to start and stop screen sharing on web clients.
 * Screen sharing is not yet implemented on mobile platforms.
 * Electron has it's own screen sharing component
 */
const ScreenshareButton = (props: ScreenSharingProps) => {
  const {primaryColor} = useContext(ColorContext);
  const {userList} = useContext(chatContext);
  const rtc = useContext(RtcContext);
  const {dispatch} = rtc;
  const {sendControlMessage} = useContext(ChatContext);
  const max = useContext(MaxUidContext);
  const min = useContext(MinUidContext);
  const users = [...max, ...min];
  const prevUsers = usePrevious({users});
  const prevUserList = usePrevious({userList});
  const {screenshareActive, setScreenshareActive, setLayout} = props;
  const {channel, appId, screenShareUid, screenShareToken, encryption} =
    useContext(PropsContext).rtcProps;

  useEffect(() => {
    rtc.RtcEngine.addListener('ScreenshareStopped', () => {
      setScreenshareActive(false);
    });
  }, []);
  useEffect(() => {
    if(prevUsers !== undefined){
      let result = users.filter(person => prevUsers.users.every(person2 => !(person2.uid === person.uid)))
      if(result.length === 1){
        const newUserUid = result[0].uid;
        if(userList[newUserUid] && userList[newUserUid].type === 1){
            dispatch({
              type: 'SwapVideo',
              value: [result[0]],
            });
            setLayout(Layout.Pinned);
        }
      }
  }
}, [users, userList])
  return (
    <TouchableOpacity
      style={
        screenshareActive
          ? style.greenLocalButton
          : [style.localButton, {borderColor: primaryColor}]
      }
      onPress={async () => {
        const isScreenActive = screenshareActive;
        // send a control message to everbody in the channel indicating that screen share is now active.
        sendControlMessage(controlMessageEnum.screenShareActive);
        try {
          await rtc.RtcEngine.startScreenshare(
            screenShareToken,
            channel,
            null,
            screenShareUid,
            appId,
            rtc.RtcEngine,
            encryption,
          );
          !isScreenActive && setScreenshareActive(true);
        } catch (e) {
          console.error("can't start the screen share", e);
        }
      }}>
      <Image
        source={{
          uri: screenshareActive
            ? icons.screenshareOffIcon
            : icons.screenshareIcon,
        }}
        style={[style.buttonIcon, {tintColor: primaryColor}]}
        resizeMode={'contain'}
      />
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  localButton: {
    backgroundColor: $config.secondaryFontColor,
    borderRadius: 20,
    borderColor: $config.primaryColor,
    width: 40,
    height: 40,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenLocalButton: {
    backgroundColor: '#4BEB5B',
    borderRadius: 20,
    borderColor: '#F86051',
    width: 40,
    height: 40,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: '90%',
    height: '90%',
    tintColor: $config.primaryColor,
  },
});

export default ScreenshareButton;

import React, {useContext, useEffect, useRef} from 'react';
import {Image, TouchableOpacity, StyleSheet} from 'react-native';
import icons from '../assets/icons';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import ColorContext from '../components/ColorContext';
import {gql, useMutation} from '@apollo/client';
import {useParams} from '../components/Router';
import ChatContext, {controlMessageEnum} from '../components/ChatContext';
import MinUidContext from '../../agora-rn-uikit/src/MinUidContext';
import MaxUidContext from '../../agora-rn-uikit/src/MaxUidContext';
import Layout from '../subComponents/LayoutEnum';


const SET_PRESENTER = gql`
  mutation setPresenter($uid: Int!, $passphrase: String!) {
    setPresenter(uid: $uid, passphrase: $passphrase)
  }
`;

const SET_NORMAL = gql`
  mutation setNormal($passphrase: String!) {
    setNormal(passphrase: $passphrase)
  }
`;


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
  const {userList} = useContext(ChatContext);
  const {primaryColor} = useContext(ColorContext);
  const rtc = useContext(RtcContext);
  const {dispatch} = rtc;
  const max = useContext(MaxUidContext);
  const min = useContext(MinUidContext);
  const users = [...max, ...min];
  const prevUsers = usePrevious({users});
  const prevUserList = usePrevious({userList});
  const {phrase} = useParams();
  const {screenshareActive, setScreenshareActive, setLayout, recordingActive} = props;
  const {channel, appId, screenShareUid, screenShareToken, encryption} =
    useContext(PropsContext).rtcProps;

  const [setPresenterQuery] = useMutation(SET_PRESENTER);
  const [setNormalQuery] = useMutation(SET_NORMAL);
  
  useEffect(() => {
    rtc.RtcEngine.addListener('ScreenshareStopped', () => {
      setScreenshareActive(false);
      console.log('STOPPED')
      setLayout((l: Layout) =>
        l === Layout.Pinned ? Layout.Grid : Layout.Pinned,
      );
    });
  }, []);

  useEffect(() => {
    if(prevUsers !== undefined){
      let result = users.filter(person => prevUsers.users.every(person2 => !(person2.uid === person.uid)))
      let leftUser = prevUsers.users.filter(person => users.every(person2 => !(person2.uid === person.uid)))

      console.log({result}, {leftUser})
      if(result.length === 1){
        const newUserUid = result[0].uid;
        if(userList[newUserUid] && userList[newUserUid].type === 1){
            dispatch({
              type: 'SwapVideo',
              value: [result[0]],
            });
            setLayout(Layout.Pinned);
        }else if(newUserUid ===  1){
          dispatch({
            type: 'SwapVideo',
            value: [result[0]],
          });
          setLayout(Layout.Pinned);
        }
      }

      if(leftUser.length === 1){
        const leftUserUid = leftUser[0].uid;
        if(userList[leftUserUid] && userList[leftUserUid].type === 1){
            setLayout((l: Layout) =>
              l === Layout.Pinned ? Layout.Grid : Layout.Pinned,
            );    
        }
      }
  }
}, [users, userList])
  console.log({screenshareActive});
  return (
    <TouchableOpacity
      style={
        screenshareActive
          ? style.greenLocalButton
          : [style.localButton, {borderColor: primaryColor}]
      }
      onPress={async () => {
        const isScreenActive = screenshareActive;
        if (!isScreenActive && recordingActive) {
          // If screen share is not going on, start the screen share by executing the graphql query
          setPresenterQuery({
            variables: {
              uid: screenShareUid,
              passphrase: phrase,
            },
          })
            .then((res) => {
              console.log(res.data);
              if (res.data.setPresenter === 'success') {
                // Once the backend sucessfuly starts screnshare,
                // send a control message to everbody in the channel indicating that screen sharing is now active.
                // sendControlMessage(controlMessageEnum.cloudRecordingActive);
                // set the local recording state to true to update the UI
                // setScreenshareActive(true);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        } else if(isScreenActive && recordingActive){
          // If recording is already going on, stop the recording by executing the graphql query.
          setNormalQuery({variables: {passphrase: phrase}})
            .then((res) => {
              console.log(res.data);
              if (res.data.stopRecordingSession === 'success') {
                // Once the backend sucessfuly stops recording,
                // send a control message to everbody in the channel indicating that cloud recording is now inactive.
                // sendControlMessage(controlMessageEnum.cloudRecordingUnactive);
                // set the local recording state to false to update the UI
                // setScreenshareActive(false);
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
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
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    borderRadius: 20,
    borderColor: $config.PRIMARY_COLOR,
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
    tintColor: $config.PRIMARY_COLOR,
  },
});

export default ScreenshareButton;

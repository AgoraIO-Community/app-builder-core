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
import {View, Text, StyleSheet, Dimensions, TextStyle} from 'react-native';
import {Icons} from '../../agora-rn-uikit';
import Settings, {
  SettingsWithViewWrapper,
  SettingsIconButtonProps,
} from './Settings';
import CopyJoinInfo, {CopyJoinInfoProps} from '../subComponents/CopyJoinInfo';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import ChatContext from '../components/ChatContext';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import {
  BtnTemplate,
  BtnTemplateInterface,
  ImageIcon,
} from '../../agora-rn-uikit';
import LiveStreamContext from './livestream';
import {numFormatter} from '../utils/index';
import {useLayout} from '../utils/useLayout';
import {useChatNotification} from '../components/chat-notification/useChatNotification';
import useLayoutsData from '../pages/video-call/useLayoutsData';
import {isIOS, isValidReactComponent, isWebInternal} from '../utils/common';
import {useChangeDefaultLayout} from '../pages/video-call/DefaultLayouts';
import {useRecording} from '../subComponents/recording/useRecording';
import LayoutIconDropdown from '../subComponents/LayoutIconDropdown';
import DimensionContext from './dimension/DimensionContext';
import {useString} from '../utils/useString';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import {useSidePanel} from '../utils/useSidePanel';
import {useChatUIControl} from './chat-ui/useChatUIControl';
import LayoutIconButton from '../subComponents/LayoutIconButton';
import {
  ButtonTemplateName,
  useButtonTemplate,
} from '../utils/useButtonTemplate';
import Styles from './styles';

const RenderSeparator = () => {
  const {getDimensionData} = useContext(DimensionContext);
  const {isDesktop} = getDimensionData();
  return isWebInternal() && isDesktop ? (
    <View style={style.navItem}>
      <View style={style.navItemSeparator}></View>
    </View>
  ) : (
    <View style={{marginHorizontal: 2}}></View>
  );
};

const ParticipantsCountView = () => {
  const {onlineUsersCount} = useContext(ChatContext);

  return (
    <>
      {onlineUsersCount !== 0 && (
        <View style={[style.navItem, {justifyContent: 'center'}]}>
          <View style={style.chip}>
            {onlineUsersCount > 0 && (
              <Text style={style.chipText}>
                {numFormatter(onlineUsersCount)}
              </Text>
            )}
          </View>
        </View>
      )}
    </>
  );
};

interface ParticipantsIconButtonProps {
  liveStreamingRequestAlertIconPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    isPanelActive: boolean,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}
const ParticipantsIconButton = (props: ParticipantsIconButtonProps) => {
  const {
    liveStreamingRequestAlertIconPosition = {
      top: isWebInternal() ? -10 : 2,
      left: undefined,
      right: undefined,
      bottom: undefined,
    },
  } = props;
  const {sidePanel, setSidePanel} = useSidePanel();
  const {isPendingRequestToReview, setLastCheckedRequestTimestamp} =
    useContext(LiveStreamContext);
  //commented for v1 release
  //const participantsLabel = useString('participantsLabel')();
  const {onlineUsersCount} = useContext(ChatContext);
  const participantsLabel = `Participants (${numFormatter(onlineUsersCount)})`;
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const isPanelActive = sidePanel === SidePanelType.Participants;

  const onPress = () => {
    isPanelActive
      ? setSidePanel(SidePanelType.None)
      : setSidePanel(SidePanelType.Participants);
    $config.EVENT_MODE && $config.RAISE_HAND;
    setLastCheckedRequestTimestamp(new Date().getTime());
  };
  let btnTemplateProps: BtnTemplateInterface = {
    onPress: onPress,
    name: isPanelActive ? 'participantActive' : 'participant',
    styleIcon: {
      width: 24,
      height: 24,
    },
  };

  if (buttonTemplateName === ButtonTemplateName.bottomBar) {
    btnTemplateProps.btnText = participantsLabel;
    btnTemplateProps.style = Styles.localButtonWithoutBG as Object;
  } else {
    btnTemplateProps.style = Styles.localButton as Object;
    btnTemplateProps.btnText = participantsLabel;
    btnTemplateProps.styleText = {
      fontFamily: 'Source Sans Pro',
      fontSize: 12,
      marginTop: 4,
      fontWeight: isPanelActive ? '700' : '400',
      color: isPanelActive ? '#FFFFFF' : '#099DFD',
    };
    //btnTemplateProps.color = isPanelActive ? '#fff' : $config.PRIMARY_COLOR;
  }
  return props?.render ? (
    props.render(onPress, isPanelActive, buttonTemplateName)
  ) : (
    <>
      <View
        style={[
          style.navItem,
          {
            backgroundColor: isPanelActive
              ? $config.PRIMARY_COLOR
              : 'transparent',
          },
        ]}>
        <BtnTemplate {...btnTemplateProps} />
      </View>
      {/* {$config.EVENT_MODE && $config.RAISE_HAND && isPendingRequestToReview && (
        <View
          style={{
            position: 'absolute',
            top: liveStreamingRequestAlertIconPosition.top,
            bottom: liveStreamingRequestAlertIconPosition.bottom,
            right: liveStreamingRequestAlertIconPosition.right,
            left: liveStreamingRequestAlertIconPosition.left,
          }}>
          <View style={[style.badge, {paddingHorizontal: 3}]}>
            <ImageIcon
              icon={Icons['exclamationIcon']}
              color={$config.SECONDARY_FONT_COLOR}
            />
          </View>
        </View>
      )} */}
    </>
  );
};

interface ChatIconButtonProps {
  badgeContainerPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  badgeTextStyle?: TextStyle;
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    isPanelActive: boolean,
    totalUnreadCount: number,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

const ChatIconButton = (props: ChatIconButtonProps) => {
  const {sidePanel, setSidePanel} = useSidePanel();
  const {
    badgeContainerPosition = {
      top: 2,
      left: 35,
      right: undefined,
      bottom: undefined,
      zIndex: 999,
    },
    badgeTextStyle = {
      color: sidePanel === SidePanelType.Chat ? '#099DFD' : '#FFFFFF',
      fontSize: 12,
      textAlign: 'center',
    },
  } = props;
  const {setUnreadGroupMessageCount, totalUnreadCount} = useChatNotification();
  const {setGroupActive, setPrivateActive, setSelectedChatUserId} =
    useChatUIControl();

  //commented for v1 release
  //const chatLabel = useString('chatLabel')();
  const chatLabel = 'Chat';
  const defaultTemplateValue = useButtonTemplate().buttonTemplateName;
  const {buttonTemplateName = defaultTemplateValue} = props;
  const isPanelActive = sidePanel === SidePanelType.Chat;
  const onPress = () => {
    if (isPanelActive) {
      setSidePanel(SidePanelType.None);
      setGroupActive(false);
      setPrivateActive(false);
      setSelectedChatUserId(0);
    } else {
      setUnreadGroupMessageCount(0);
      setGroupActive(true);
      setSidePanel(SidePanelType.Chat);
    }
  };
  let btnTemplateProps: BtnTemplateInterface = {
    onPress: onPress,
    //name: totalUnreadCount !== 0 ? 'unreadChatIcon' : 'chatIcon',
    //todo hari
    name: isPanelActive ? 'chatActive' : 'chat',
    styleIcon: {
      width: 24,
      height: 24,
    },
  };

  if (buttonTemplateName === ButtonTemplateName.bottomBar) {
    btnTemplateProps.btnText = chatLabel;
    btnTemplateProps.style = Styles.localButtonWithoutBG as Object;
  } else {
    btnTemplateProps.style = Styles.localButton as Object;
    btnTemplateProps.btnText = chatLabel;
    btnTemplateProps.styleText = {
      fontFamily: 'Source Sans Pro',
      fontSize: 12,
      marginTop: 4,
      fontWeight: isPanelActive ? '700' : '400',
      color: isPanelActive ? '#FFFFFF' : '#099DFD',
    };
  }
  const renderBadge = (badgeCount: any) => {
    return (
      <View
        style={{
          position: 'absolute',
          top: badgeContainerPosition?.top,
          bottom: badgeContainerPosition?.bottom,
          left: badgeContainerPosition?.left,
          right: badgeContainerPosition?.right,
          borderRadius: 10,
          width: 20,
          height: 20,
          backgroundColor:
            sidePanel === SidePanelType.Chat
              ? '#FFFFFF'
              : $config.PRIMARY_COLOR,
          justifyContent: 'center',
        }}>
        <Text
          style={{
            ...badgeTextStyle,
          }}>
          {numFormatter(3)}
        </Text>
      </View>
    );
  };
  return props?.render ? (
    props.render(onPress, isPanelActive, totalUnreadCount, buttonTemplateName)
  ) : (
    <>
      <View
        style={[
          style.navItem,
          {
            backgroundColor: isPanelActive
              ? $config.PRIMARY_COLOR
              : 'transparent',
          },
        ]}>
        <BtnTemplate {...btnTemplateProps} />
        {totalUnreadCount !== 1 && renderBadge(totalUnreadCount)}
      </View>
    </>
  );
};

interface LayoutIconButtonProps {
  modalPosition?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
  buttonTemplateName?: ButtonTemplateName;
  render?: (
    onPress: () => void,
    buttonTemplateName?: ButtonTemplateName,
  ) => JSX.Element;
}

const SettingsIconButton = (props: SettingsIconButtonProps) => {
  return <Settings {...props} />;
};
const SettingsIconButtonWithWrapper = (props: SettingsIconButtonProps) => {
  return <SettingsWithViewWrapper {...props} />;
};

const Navbar = () => {
  //commented for v1 release
  //const recordingLabel = useString('recordingLabel')();
  const recordingLabel = 'Recording';
  const {
    data: {meetingTitle},
  } = useMeetingInfo();

  const {isRecordingActive} = useRecording();
  const {getDimensionData} = useContext(DimensionContext);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isDesktop = dim[0] > 1224;

  const [showIcon, setShowIcon] = useState(true);
  React.useEffect(() => {
    // Change the state every second or the time given by User.
    const interval = setInterval(() => {
      setShowIcon((showIcon) => !showIcon);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      testID="videocall-topbar"
      onLayout={onLayout}
      style={[
        isWebInternal() ? style.navHolder : style.navHolderNative,
        {paddingHorizontal: isDesktop ? 30 : 10},
      ]}>
      <View testID="videocall-meetingName" style={style.roomNameContainer}>
        <Text style={style.roomNameText} numberOfLines={1} ellipsizeMode="tail">
          {meetingTitle}
        </Text>
        {isRecordingActive && !isMobileOrTablet() ? (
          <View style={[style.recordingView]}>
            <View
              style={[style.recordingStatus, {opacity: showIcon ? 1 : 0}]}
            />
            <Text style={style.recordingText}>{recordingLabel}</Text>
          </View>
        ) : (
          <></>
        )}
      </View>
      <View style={style.navControlBar} testID="videocall-navcontrols">
        <View testID="videocall-participantsicon">
          <ParticipantsIconButton />
        </View>
        {$config.CHAT && (
          <View testID="videocall-chaticon">
            <ChatIconButton />
          </View>
        )}
        <View testID="videocall-settingsicon">
          <SettingsIconButtonWithWrapper />
        </View>
      </View>
    </View>
  );
};
type NavBarComponentsArrayProps = [
  (props: CopyJoinInfoProps) => JSX.Element,
  () => JSX.Element,
  (props: ParticipantsIconButtonProps) => JSX.Element,
  (props: ChatIconButtonProps) => JSX.Element,
  (props: LayoutIconButtonProps) => JSX.Element,
  (props: SettingsIconButtonProps) => JSX.Element,
];
export const NavBarComponentsArray: NavBarComponentsArrayProps = [
  CopyJoinInfo,
  ParticipantsCountView,
  ParticipantsIconButton,
  ChatIconButton,
  LayoutIconButton,
  SettingsIconButton,
];

const style = StyleSheet.create({
  navHolder: {
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navHolderNative: {
    position: 'relative',
    width: '100%',
    height: '8%',
    backgroundColor: $config.SECONDARY_FONT_COLOR + '80',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  recordingView: {
    height: 36,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#FF414D' + '10',
    marginLeft: 8,
  },
  recordingText: {
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
    color: '#ff414D',
  },
  recordingStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF414D',
    marginRight: 8,
  },
  recordingIcon: {
    width: 20,
    height: 20,
    margin: 1,
    resizeMode: 'contain',
  },
  btnHolder: {
    marginHorizontal: isMobileOrTablet() ? 2 : 0,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  btnHolderCustom: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  roomNameContainer: {
    zIndex: 10,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomNameText: {
    fontSize: 16,
    lineHeight: 16,
    color: $config.PRIMARY_FONT_COLOR,
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
  },
  chip: {
    backgroundColor: $config.PRIMARY_COLOR,
    borderRadius: 2.5,
    paddingHorizontal: 5,
    marginHorizontal: 5,
    paddingVertical: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: isIOS() ? 'Helvetica' : 'sans-serif',
    fontSize: 12,
    color: $config.SECONDARY_FONT_COLOR,
  },
  navControlBar: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 9,
  },
  navContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: isWebInternal()
      ? $config.SECONDARY_FONT_COLOR
      : $config.SECONDARY_FONT_COLOR + '00',
    paddingVertical: 4,
    paddingHorizontal: isMobileOrTablet() ? 0 : 10,
    minHeight: 35,
    borderRadius: 10,
  },
  navItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  navSmItem: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '15%',
  },
  navItemSeparator: {
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    width: 1,
    height: '100%',
    marginHorizontal: 10,
    alignSelf: 'center',
    opacity: 0.8,
  },
  navItemSeparatorHorizontal: {
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    width: '100%',
    height: 1,
    marginVertical: 10,
    alignSelf: 'center',
    opacity: 0.8,
  },
  dropdownIconContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },
  separaterContainer: {
    flex: 0.5,
    paddingHorizontal: 5,
  },
  dropdownContainer: {
    position: 'absolute',
    marginTop: 5,
    width: 40,
    height: 90,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
  },
});

export default Navbar;

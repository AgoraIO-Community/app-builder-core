import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import React, {useContext} from 'react';
import SidePanelHeader, {
  SidePanelStyles,
} from '../../subComponents/SidePanelHeader';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import ThemeConfig from '../../theme';
import {useChatNotification} from '../../components/chat-notification/useChatNotification';
import {useSidePanel} from '../../utils/useSidePanel';
import {SidePanelType} from '../../subComponents/SidePanelEnum';
import {useChatUIControl} from '../../components/chat-ui/useChatUIControl';
import {numFormatter} from '../../utils';
import ChatContext from '../../components/ChatContext';
import {useCaption} from '../../subComponents/caption/useCaption';
import ActionMenu, {ActionMenuItem} from '../../atoms/ActionMenu';
import {calculatePosition, isWebInternal} from '../../utils/common';
import LanguageSelectorPopup from '../../subComponents/caption/LanguageSelectorPopup';
import useSTTAPI from '../../subComponents/caption/useSTTAPI';
import events, {EventPersistLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import useGetName from '../../utils/useGetName';
import {LanguageType} from '../../subComponents/caption/utils';
import {useMeetingInfo} from 'customization-api';
import useStreamMessageUtils from '../../subComponents/caption/useStreamMessageUtils';
import useTranscriptDownload from '../../subComponents/caption/useTranscriptDownload';

export const SettingsHeader = (props) => {
  const {setSidePanel} = useSidePanel();
  const settingsLabel = 'Settings';
  return (
    <SidePanelHeader
      centerComponent={
        <Text style={SidePanelStyles.heading}>{settingsLabel}</Text>
      }
      trailingIconName="close"
      trailingIconOnPress={() => {
        props.handleClose && props.handleClose();
        setSidePanel(SidePanelType.None);
      }}
    />
  );
};

export const PeopleHeader = () => {
  const {onlineUsersCount} = useContext(ChatContext);
  const participantsLabel = `People (${numFormatter(onlineUsersCount)})`;
  const {setSidePanel} = useSidePanel();
  return (
    <SidePanelHeader
      centerComponent={
        <Text style={SidePanelStyles.heading}>{participantsLabel}</Text>
      }
      trailingIconName="close"
      trailingIconOnPress={() => {
        setSidePanel(SidePanelType.None);
      }}
    />
  );
};

export const ChatHeader = () => {
  const {
    unreadGroupMessageCount,
    setUnreadGroupMessageCount,
    unreadPrivateMessageCount,
    setUnreadPrivateMessageCount,
    setUnreadIndividualMessageCount,
    unreadIndividualMessageCount,
  } = useChatNotification();

  const {setSidePanel} = useSidePanel();
  const groupChatLabel = 'Group';
  const privateChatLabel = 'Private';

  const {
    groupActive,
    setGroupActive,
    privateActive,
    setPrivateActive,
    setSelectedChatUserId: setSelectedUser,
  } = useChatUIControl();

  const selectGroup = () => {
    setPrivateActive(false);
    setGroupActive(true);
    //move this logic into ChatContainer
    //setUnreadGroupMessageCount(0);
    setSelectedUser(0);
  };
  const selectPrivate = () => {
    setGroupActive(false);
    setSelectedUser(0);
    setPrivateActive(false);
  };

  return (
    <SidePanelHeader
      isChat={true}
      leadingIconName={privateActive ? 'back-btn' : null}
      leadingIconOnPress={
        privateActive
          ? () => {
              setSelectedUser(0);
              setPrivateActive(false);
            }
          : () => {}
      }
      centerComponent={
        <View style={styles.buttonHolder}>
          <TouchableOpacity
            onPress={selectGroup}
            style={
              groupActive ? styles.activeContainer : styles.nonActiveContainer
            }>
            {unreadGroupMessageCount !== 0 ? (
              <View style={styles.chatNotification} />
            ) : null}
            <Text
              style={groupActive ? styles.activeText : styles.nonActiveText}>
              {groupChatLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={selectPrivate}
            style={
              !groupActive
                ? [styles.activeContainer]
                : [styles.nonActiveContainer]
            }>
            {unreadPrivateMessageCount !== 0 ? (
              <View style={styles.chatNotification} />
            ) : null}
            <Text
              style={!groupActive ? styles.activeText : styles.nonActiveText}>
              {privateChatLabel}
            </Text>
          </TouchableOpacity>
        </View>
      }
      trailingIconName="close"
      trailingIconOnPress={() => {
        setSidePanel(SidePanelType.None);
      }}
    />
  );
};

export const TranscriptHeader = (props) => {
  const {setSidePanel} = useSidePanel();
  const moreIconRef = React.useRef<View>(null);
  const [actionMenuVisible, setActionMenuVisible] =
    React.useState<boolean>(false);

  const label = 'Meeting Transcript';

  return (
    <SidePanelHeader
      centerComponent={<Text style={SidePanelStyles.heading}>{label}</Text>}
      trailingIconName={'more-menu'}
      ref={moreIconRef}
      trailingIconOnPress={() => {
        setActionMenuVisible(true);
      }}
      trailingIconName2={'close'}
      trailingIconOnPress2={() => {
        setSidePanel(SidePanelType.None);
      }}>
      <TranscriptHeaderActionMenu
        actionMenuVisible={actionMenuVisible}
        setActionMenuVisible={setActionMenuVisible}
        btnRef={moreIconRef}
      />
    </SidePanelHeader>
  );
};

interface TranscriptHeaderActionMenuProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: (actionMenuVisible: boolean) => void;
  btnRef: React.RefObject<View>;
}

const TranscriptHeaderActionMenu = (props: TranscriptHeaderActionMenuProps) => {
  const {actionMenuVisible, setActionMenuVisible, btnRef} = props;
  const {
    language: prevLang,
    meetingTranscript,
    isLangChangeInProgress,
    setLanguage,
  } = useCaption();
  const {downloadTranscript} = useTranscriptDownload();
  const [modalPosition, setModalPosition] = React.useState({});
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);
  const {restart} = useSTTAPI();
  const username = useGetName();
  const actionMenuitems: ActionMenuItem[] = [];
  const {
    data: {isHost},
  } = useMeetingInfo();

  isHost &&
    actionMenuitems.push({
      icon: 'lang-select',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: 'Change Spoken Language ',
      disabled: isLangChangeInProgress,
      callback: () => {
        setActionMenuVisible(false);
        setLanguagePopup(true);
      },
    });

  actionMenuitems.push({
    icon: 'download',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: 'Download Transcript',
    disabled: meetingTranscript.length === 0,
    callback: () => {
      downloadTranscript();
      setActionMenuVisible(false);
    },
  });

  const onLanguageChange = (langChanged = false, language: LanguageType[]) => {
    setLanguagePopup(false);
    if (langChanged) {
      restart(language)
        .then(() => {
          console.log('stt restarted successfully');
        })
        .catch((error) => {
          console.log('Error in restarting', error);
          // Handle the error case
        });
    }
  };

  React.useEffect(() => {
    if (actionMenuVisible) {
      //getting btnRef x,y
      btnRef?.current?.measure(
        (
          _fx: number,
          _fy: number,
          localWidth: number,
          localHeight: number,
          px: number,
          py: number,
        ) => {
          const data = calculatePosition({
            px,
            py,
            localWidth,
            localHeight,
            globalHeight,
            globalWidth,
          });
          setModalPosition(data);
          setIsPosCalculated(true);
        },
      );
    }
  }, [actionMenuVisible]);
  return (
    <>
      <ActionMenu
        from={'transcript-header'}
        actionMenuVisible={actionMenuVisible && isPosCalculated}
        setActionMenuVisible={setActionMenuVisible}
        modalPosition={modalPosition}
        items={actionMenuitems}
      />

      <LanguageSelectorPopup
        modalVisible={isLanguagePopupOpen}
        setModalVisible={setLanguagePopup}
        onConfirm={onLanguageChange}
      />
    </>
  );
};

const styles = StyleSheet.create({
  buttonHolder: {
    backgroundColor:
      $config.HARD_CODED_BLACK_COLOR + hexadecimalTransparency['30%'],
    borderRadius: 12,
    flexDirection: 'row',
  },
  chatViewNative: {
    zIndex: 5,
    width: '100%',
    height: '100%',
    right: 0,
    bottom: 0,
  },
  chatInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeContainer: {
    margin: 2,
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderRadius: 11,
    alignSelf: 'center',
  },
  nonActiveContainer: {
    alignSelf: 'center',
  },
  activeText: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: 12,
    color: $config.PRIMARY_ACTION_TEXT_COLOR,
  },
  nonActiveText: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: 12,
    color: $config.FONT_COLOR,
  },
  chatNotification: {
    width: 8,
    height: 8,
    backgroundColor: $config.SEMANTIC_ERROR,
    borderRadius: 30,
    position: 'absolute',
    right: 8,
    top: 4,
  },
});

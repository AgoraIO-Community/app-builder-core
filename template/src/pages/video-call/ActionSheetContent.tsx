/* eslint-disable react-native/no-inline-styles */
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useContext} from 'react';
import ImageIcon from '../../atoms/ImageIcon';
import LocalAudioMute from '../../subComponents/LocalAudioMute';
import LocalVideoMute from '../../subComponents/LocalVideoMute';
import LocalEndcall from '../../subComponents/LocalEndCall';
import CopyJoinInfo from '../../subComponents/CopyJoinInfo';
import LocalSwitchCamera from '../../subComponents/LocalSwitchCamera';
import Recording from '../../subComponents/Recording';
import ChatContext from '../../components/ChatContext';
import {PropsContext, ToggleState} from '../../../agora-rn-uikit';
import {ClientRole} from '../../../agora-rn-uikit';
import {useMeetingInfo} from '../../components/meeting-info/useMeetingInfo';
import LiveStreamControls from '../../components/livestream/views/LiveStreamControls';
import LiveStreamContext, {RaiseHandValue} from '../../components/livestream';
import {
  ChatIconButton,
  ParticipantsIconButton,
} from '../../../src/components/Navbar';
import {useChatNotification} from '../../components/chat-notification/useChatNotification';
import {SidePanelType} from '../../subComponents/SidePanelEnum';
import {useSidePanel} from '../../utils/useSidePanel';
import {useLocalUserInfo, useRender} from 'customization-api';
import LayoutIconButton from '../../subComponents/LayoutIconButton';
import CaptionIcon from '../../../src/subComponents/caption/CaptionIcon';
import TranscriptIcon from '../../../src/subComponents/caption/TranscriptIcon';
import useSTTAPI from '../../../src/subComponents/caption/useSTTAPI';
import Carousel from '../../atoms/Carousel';
import {useCaption} from '../../subComponents/caption/useCaption';

import ScreenshareButton from '../../subComponents/screenshare/ScreenshareButton';
import {useScreenshare} from '../../subComponents/screenshare/useScreenshare';
import {EventNames} from '../../rtm-events';
import events from '../../rtm-events-api';
import {getLanguageLabel} from '../../subComponents/caption/utils';
import Toast from '../../../react-native-toast-message';
//Icon for expanding Action Sheet
interface ShowMoreIconProps {
  isExpanded: boolean;
  showNotification: boolean;
  onPress: () => void;
}
const ShowMoreIcon = (props: ShowMoreIconProps) => {
  const {isExpanded, onPress, showNotification} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={onPress}>
          <ImageIcon
            name={isExpanded ? 'arrow-down' : 'more-menu'}
            tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
          />
        </TouchableOpacity>
        {showNotification && <View style={styles.notification} />}
      </View>
    </View>
  );
};

//Icon for Live Streaming Controls
interface LiveStreamIconProps {
  isHandRaised: boolean;
  showLabel?: boolean;
}
const LiveStreamIcon = (props: LiveStreamIconProps) => {
  const {isHandRaised, showLabel = $config.ICON_TEXT} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <LiveStreamControls
          showControls={true}
          isDesktop={false}
          showLabel={false}
        />
      </View>
      {showLabel && (
        <Text style={styles.iconText}>
          {isHandRaised ? 'Lower\nHand' : 'Raise\nHand'}
        </Text>
      )}
    </View>
  );
};

//Icon for Chat
interface ChatIconProps {
  showLabel?: boolean;
}
const ChatIcon = (props: ChatIconProps) => {
  const {showLabel = $config.ICON_TEXT} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <ChatIconButton isOnActionSheet={true} />
      </View>
      {showLabel && <Text style={styles.iconText}>Chat</Text>}
    </View>
  );
};

//Icon for Participants
interface ParticipantsIconProps {
  showNotification: boolean;
}
const ParticipantsIcon = (props: ParticipantsIconProps) => {
  const {showNotification} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <ParticipantsIconButton isOnActionSheet={true} />
      </View>
      {$config.ICON_TEXT && <Text style={styles.iconText}>People</Text>}
      {/* {showNotification && <View style={styles.notification} />} */}
    </View>
  );
};

//Icon for Recording
interface RecordingIconProps {
  showLabel?: boolean;
}
const RecordingIcon = (props: RecordingIconProps) => {
  const {showLabel = $config.ICON_TEXT} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <Recording showLabel={false} isOnActionSheet={true} />
      </View>
      {showLabel && <Text style={styles.iconText}>Record</Text>}
    </View>
  );
};

interface SwitchCameraIconProps {
  disabled: boolean;
}
const SwitchCameraIcon = (props: SwitchCameraIconProps) => {
  const {disabled} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <LocalSwitchCamera showLabel={false} disabled={disabled} />
      </View>
      {$config.ICON_TEXT && (
        <View>
          <Text
            style={[
              styles.iconText,
              {
                color: disabled ? $config.SEMANTIC_NEUTRAL : $config.FONT_COLOR,
              },
            ]}>
            Switch
          </Text>
          <Text
            style={[
              styles.iconText,
              {
                color: disabled ? $config.SEMANTIC_NEUTRAL : $config.FONT_COLOR,
                marginTop: 0,
              },
            ]}>
            Camera
          </Text>
        </View>
      )}
    </View>
  );
};

interface SettingsIconProps {
  onPress: () => void;
}
const SettingsIcon = (props: SettingsIconProps) => {
  const {onPress} = props;
  return (
    <View style={styles.iconWithText}>
      <TouchableOpacity style={styles.iconContainer} onPress={onPress}>
        <ImageIcon
          name={'settings'}
          tintColor={$config.SECONDARY_ACTION_COLOR}
        />
      </TouchableOpacity>
      {$config.ICON_TEXT && <Text style={styles.iconText}>Settings</Text>}
    </View>
  );
};

const ShareIcon = () => {
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <CopyJoinInfo showLabel={false} isOnActionSheet={true} />
      </View>
      {$config.ICON_TEXT && <Text style={styles.iconText}>Invite</Text>}
    </View>
  );
};
const ScreenshareIcon = () => {
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <ScreenshareButton showLabel={false} isOnActionSheet={true} />
      </View>
      {$config.ICON_TEXT && <Text style={styles.iconText}>Screen Share</Text>}
    </View>
  );
};

interface AudioIconProps {
  isMobileView: boolean;
  isOnActionSheet: boolean;
  showLabel: boolean;
  disabled: boolean;
}
const AudioIcon = (props: AudioIconProps) => {
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <LocalAudioMute {...props} />
      </View>
    </View>
  );
};

interface CamIconProps {
  isMobileView: boolean;
  isOnActionSheet: boolean;
  showLabel: boolean;
  disabled: boolean;
}
const CamIcon = (props: CamIconProps) => {
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <LocalVideoMute {...props} />
      </View>
    </View>
  );
};

interface EndCallIconProps {
  showLabel: boolean;
  isOnActionSheet: boolean;
}
const EndCallIcon = (props: EndCallIconProps) => {
  return (
    <View style={styles.iconWithText}>
      <View
        style={[
          styles.iconContainer,
          {backgroundColor: $config.SEMANTIC_ERROR},
        ]}>
        <LocalEndcall {...props} />
      </View>
    </View>
  );
};

interface LayoutIconProps {
  showLabel?: boolean;
}
const LayoutIcon = (props: LayoutIconProps) => {
  const {showLabel = $config.ICON_TEXT} = props;
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <LayoutIconButton showLabel={false} />
      </View>
      {showLabel && <Text style={styles.iconText}>Layout</Text>}
    </View>
  );
};

interface CaptionIconBtnProps {
  showLabel?: boolean;
  onPress?: () => void;
}

const CaptionIconBtn = (props: CaptionIconBtnProps) => {
  const {showLabel = $config.ICON_TEXT, onPress} = props;
  const {isCaptionON, isSTTActive} = useCaption();
  const {
    data: {isHost},
  } = useMeetingInfo();

  const isDisabled = !(
    $config.ENABLE_STT &&
    (isHost || (!isHost && isSTTActive))
  );
  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <CaptionIcon
          isOnActionSheet={true}
          showLabel={false}
          closeActionSheet={onPress}
        />
      </View>
      {showLabel && (
        <View>
          <Text
            style={[
              styles.iconText,
              {
                color: isDisabled
                  ? $config.SEMANTIC_NEUTRAL
                  : $config.FONT_COLOR,
              },
            ]}>
            {isCaptionON ? 'Hide' : 'Show'}
          </Text>
          <Text
            style={[
              styles.iconText,
              {
                color: isDisabled
                  ? $config.SEMANTIC_NEUTRAL
                  : $config.FONT_COLOR,
                marginTop: 0,
              },
            ]}>
            Caption
          </Text>
        </View>
      )}
    </View>
  );
};

interface TranscriptIconProps {
  showLabel?: boolean;
}

const TranscriptIconBtn = (props: TranscriptIconProps) => {
  const {showLabel = $config.ICON_TEXT} = props;
  const {sidePanel} = useSidePanel();
  const isTranscriptON = sidePanel === SidePanelType.Transcript;
  const {isSTTActive} = useCaption();
  const {
    data: {isHost},
  } = useMeetingInfo();

  const isDisabled = !(
    $config.ENABLE_STT &&
    (isHost || (!isHost && isSTTActive))
  );

  return (
    <View style={styles.iconWithText}>
      <View style={styles.iconContainer}>
        <TranscriptIcon isOnActionSheet={true} showLabel={false} />
      </View>
      {showLabel && (
        <View>
          <Text
            style={[
              styles.iconText,
              {
                color: isDisabled
                  ? $config.SEMANTIC_NEUTRAL
                  : $config.FONT_COLOR,
              },
            ]}>
            {isTranscriptON ? 'Hide' : 'Show'}
          </Text>
          <Text
            style={[
              styles.iconText,
              {
                color: isDisabled
                  ? $config.SEMANTIC_NEUTRAL
                  : $config.FONT_COLOR,
                marginTop: 0,
              },
            ]}>
            Transcript
          </Text>
        </View>
      )}
    </View>
  );
};

type ActionSheetComponentsProps = [
  (props: AudioIconProps) => JSX.Element,
  (props: CamIconProps) => JSX.Element,
  (props: EndCallIconProps) => JSX.Element,
  (props: ShowMoreIconProps) => JSX.Element,
  (props: ChatIconProps) => JSX.Element,
  (props: ParticipantsIconProps) => JSX.Element,
  (props) => JSX.Element,
  (props: SwitchCameraIconProps) => JSX.Element,
  (props: LayoutIconProps) => JSX.Element,
  (props: SettingsIconProps) => JSX.Element,
  (props) => JSX.Element,
];

export const ActionSheetComponentsArray: ActionSheetComponentsProps = [
  AudioIcon,
  CamIcon,
  EndCallIcon,
  ShowMoreIcon,
  ChatIcon,
  ParticipantsIcon,
  RecordingIcon,
  SwitchCameraIcon,
  LayoutIcon,
  SettingsIcon,
  ShareIcon,
];

const ToastIcon = ({color}) => (
  <View style={{marginRight: 12, alignSelf: 'center', width: 24, height: 24}}>
    <ImageIcon iconType="plain" tintColor={color} name={'lang-select'} />
  </View>
);

const ActionSheetContent = props => {
  const {handleSheetChanges, isExpanded, native = false} = props;
  const {localUid} = useContext(ChatContext);
  const {isScreenshareActive} = useScreenshare();
  const {rtcProps} = useContext(PropsContext);
  const {setSidePanel} = useSidePanel();
  const {
    data: {isHost},
  } = useMeetingInfo();
  const {isPendingRequestToReview, raiseHandList} =
    useContext(LiveStreamContext);
  const {totalUnreadCount} = useChatNotification();
  const {setIsSTTActive, setLanguage, setMeetingTranscript} = useCaption();
  const {renderList} = useRender();

  //STT events on mount

  React.useEffect(() => {
    if (native) return;
    events.on(EventNames.STT_ACTIVE, data => {
      const payload = JSON.parse(data?.payload);
      setIsSTTActive(payload.active);
    });
  }, []);
  React.useEffect(() => {
    if (native) return;
    events.on(EventNames.STT_LANGUAGE, data => {
      const {username, prevLang, newLang, uid} = JSON.parse(data?.payload);
      const actionText =
        prevLang.indexOf('') !== -1
          ? `has set the spoken language to  "${getLanguageLabel(newLang)}" `
          : `changed the spoken language from "${getLanguageLabel(
              prevLang,
            )}" to "${getLanguageLabel(newLang)}" `;
      const msg = `${renderList[uid]?.name || username} ${actionText} `;

      Toast.show({
        type: 'info',
        leadingIcon: <ToastIcon color={$config.SECONDARY_ACTION_COLOR} />,
        text1: `Spoken Language ${
          prevLang.indexOf('') !== -1 ? 'Set' : 'Changed'
        }`,
        visibilityTime: 3000,
        text2: msg,
        primaryBtn: null,
        secondaryBtn: null,
      });
      // syncing local set language
      newLang && setLanguage(newLang);
      // add spoken lang msg to transcript
      setMeetingTranscript(prev => {
        return [
          ...prev,
          {
            name: 'langUpdate',
            time: new Date().getTime(),
            uid: `langUpdate-${uid}`,
            text: actionText,
          },
        ];
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLiveStream = $config.EVENT_MODE && !$config.AUDIO_ROOM;
  const isAudience = rtcProps?.role === ClientRole.Audience;
  const isBroadCasting = rtcProps?.role === ClientRole.Broadcaster;
  const isHandRaised = raiseHandList[localUid]?.raised === RaiseHandValue.TRUE;

  const isAudioRoom = $config.AUDIO_ROOM;
  const isVoiceChatHost = !$config.EVENT_MODE && $config.AUDIO_ROOM && isHost;
  const isVoiceChatAudience =
    !$config.EVENT_MODE && $config.AUDIO_ROOM && isAudience;
  const isAudioCastHost = $config.EVENT_MODE && $config.AUDIO_ROOM && isHost;
  const isAudioCastAudience =
    $config.EVENT_MODE && $config.AUDIO_ROOM && isAudience;

  const isAudioVideoControlsDisabled =
    isAudience && $config.EVENT_MODE && !$config.RAISE_HAND;

  const isConferencing = !$config.EVENT_MODE && !$config.AUDIO_ROOM;

  const isPaginationRequired = isLiveStream || (isConferencing && isHost);
  const localUser = useLocalUserInfo();

  const isVideoDisabled = native
    ? localUser.video === ToggleState.disabled || isScreenshareActive
    : localUser.video === ToggleState.disabled;
  return (
    <View>
      {/* Row Always Visible */}
      <View
        style={[
          styles.row,
          {borderBottomWidth: 1, paddingTop: 4, justifyContent: 'center'},
        ]}>
        {isAudioVideoControlsDisabled ? null : (
          <AudioIcon
            isMobileView={true}
            isOnActionSheet={true}
            showLabel={false}
            disabled={isLiveStream && isAudience && !isBroadCasting}
          />
        )}

        {/*For AudioCast Host:Chat ,Attendee:Raise Hand 
          For VoiceChat Host:Chat, Attendee:Chat
         */}

        {(isAudioCastHost || isVoiceChatHost || isVoiceChatAudience) && (
          <ChatIcon showLabel={false} />
        )}
        {isAudioCastAudience ||
        (isLiveStream && isAudience) ||
        (isBroadCasting && !isHost) ? (
          $config.RAISE_HAND && isAudioRoom ? (
            <LiveStreamIcon isHandRaised={isHandRaised} showLabel={false} />
          ) : null
        ) : null}

        {!isAudioRoom &&
          (isAudioVideoControlsDisabled ? null : (
            <CamIcon
              isOnActionSheet={true}
              isMobileView={true}
              showLabel={false}
              disabled={isLiveStream && isAudience && !isBroadCasting}
            />
          ))}

        <EndCallIcon showLabel={false} isOnActionSheet={true} />

        <ShowMoreIcon
          showNotification={
            (!isExpanded && totalUnreadCount !== 0) ||
            ($config.EVENT_MODE && isPendingRequestToReview)
          }
          isExpanded={isExpanded}
          onPress={() => handleSheetChanges(isExpanded ? 0 : 1)}
        />
      </View>

      <CarouselWrapper
        isPaginationRequired={
          $config.ENABLE_STT && isPaginationRequired && !native
        }
        native={native}>
        <>
          {/**
           * In event mode when raise hand feature is active
           * and audience is promoted to host, the audience can also
           * demote himself
           */}
          {(isLiveStream && isAudience) || (isBroadCasting && !isHost) ? (
            $config.RAISE_HAND && !isAudioRoom ? (
              <LiveStreamIcon isHandRaised={isHandRaised} />
            ) : null
          ) : null}

          {/* Layout view */}
          <LayoutIcon />

          {/* chat */}
          {!(isAudioCastHost || isVoiceChatHost || isVoiceChatAudience) && (
            <ChatIcon />
          )}
          {/* participants */}
          <ParticipantsIcon
            showNotification={$config.EVENT_MODE && isPendingRequestToReview}
          />
          {/* record */}
          {isHost && $config.CLOUD_RECORDING ? <RecordingIcon /> : null}

          {/* switch camera */}
          {!isAudioRoom &&
            (isAudioVideoControlsDisabled ? null : (
              <SwitchCameraIcon
                disabled={
                  (isLiveStream && isAudience && !isBroadCasting) ||
                  isVideoDisabled
                }
              />
            ))}

          {/* settings */}
          <SettingsIcon
            onPress={() => {
              setSidePanel(SidePanelType.Settings);
            }}
          />

          {/* invite */}
          <ShareIcon />
          {/* caption  */}
          {$config.ENABLE_STT && !native ? (
            <CaptionIconBtn
              onPress={() => handleSheetChanges(isExpanded ? 0 : 1)}
            />
          ) : (
            <></>
          )}
          {/* {native && !$config.ENABLE_STT && $config.SCREEN_SHARING ? (
            <ScreenshareIcon />
          ) : (
            <></>
          )} */}
        </>
      </CarouselWrapper>
    </View>
  );
};

const CarouselWrapper = ({isPaginationRequired, children, native}) => {
  return isPaginationRequired ? (
    <View style={{flexDirection: 'row'}}>
      <Carousel
        data={[
          {
            id: 'slide_1',
            component: <View style={styles.row}>{children}</View>,
          },
          {
            id: 'slide_2',
            component: (
              <View style={styles.row}>
                {/* Transcript */}
                <TranscriptIconBtn />
                {/* {native && $config.SCREEN_SHARING ? <ScreenshareIcon /> : <></>} */}
              </View>
            ),
          },
        ]}
      />
    </View>
  ) : (
    <View style={styles.row}>
      {$config.ENABLE_STT && !native ? (
        <>
          {children}
          <TranscriptIconBtn />
        </>
      ) : (
        children
      )}
    </View>
  );
};

export default ActionSheetContent;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 24,
    borderColor: $config.CARD_LAYER_3_COLOR,
    flexWrap: 'wrap',
  },

  iconContainer: {
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconWithText: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '25%',
    paddingBottom: 24,
  },
  iconText: {
    color: $config.FONT_COLOR,
    marginTop: 8,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
    textAlign: 'center',
  },
  notification: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: $config.SEMANTIC_ERROR,
    borderRadius: 6,
    top: -1,
    right: 5,
  },
});

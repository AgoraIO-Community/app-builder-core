import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import {ClientRoleType, PropsContext} from '../../../agora-rn-uikit';
import {useRoomInfo} from 'customization-api';
import IconButton, {IconButtonProps} from '../../atoms/IconButton';
import {useToolbarProps} from '../../atoms/ToolbarItem';
import {useActionSheet} from '../../utils/useActionSheet';
import {isMobileUA, isWebInternal} from '../../utils/common';
import {useString} from '../../utils/useString';
import {toolbarItemReactionText} from '../../language/default-labels/videoCallScreenLabels';
import {useVideoCall} from '../useVideoCall';
import StorageContext from '../StorageContext';
import {
  LIVE_REACTIONS,
  LiveReactionDefinition,
  SKIN_TONE_CODES,
  SKIN_TONE_MODIFIER,
  SkinTonePreference,
  applySkinToneToEmoji,
} from './catalog';

const TRAY_WIDTH = 260;
const TRAY_HEIGHT = 240;

const TONE_OPTIONS: {value: SkinTonePreference; label: string}[] = [
  {value: 'default', label: '👋'},
  ...SKIN_TONE_CODES.map(code => ({
    value: code,
    label: SKIN_TONE_MODIFIER[code],
  })),
];

const ReactionTray = ({
  onSelect,
  tone,
  setTone,
}: {
  onSelect: (reaction: LiveReactionDefinition) => void;
  tone: SkinTonePreference;
  setTone: (next: SkinTonePreference) => void;
}) => {
  const [hoveredReactionKey, setHoveredReactionKey] = React.useState('');

  return (
    <View style={styles.tray}>
      <View style={styles.toneRow}>
        {TONE_OPTIONS.map(option => {
          const isSelected = option.value === tone;
          return (
            <Pressable
              key={option.value}
              onPress={() => setTone(option.value)}
              style={[
                styles.toneButton,
                isSelected ? styles.toneButtonSelected : null,
              ]}>
              <Text style={styles.toneEmoji}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.emojiGrid}>
        {LIVE_REACTIONS.map(reaction => {
          const scale =
            isWebInternal() && hoveredReactionKey === reaction.key
              ? 37 / 24
              : 1;
          const webHoverTransition = isWebInternal()
            ? {
                transitionProperty: 'transform',
                transitionDuration: '180ms',
                transitionTimingFunction: 'ease-in-out',
              }
            : {};
          return (
            <Pressable
              key={reaction.key}
              onHoverIn={() => {
                setHoveredReactionKey(reaction.key);
              }}
              onHoverOut={() => {
                setHoveredReactionKey('');
              }}
              onPress={() => {
                onSelect(reaction);
              }}
              style={[
                styles.reactionButton,
                webHoverTransition,
                {transform: [{scale}]},
              ]}>
              <Text style={styles.reactionEmoji}>
                {applySkinToneToEmoji(reaction, tone)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const LiveReactionButton = () => {
  const {label = null, iconSize, containerStyle} = useToolbarProps();
  const {emitLiveReaction} = useVideoCall();
  const {isOnActionSheet, showLabel} = useActionSheet();
  const reactionLabel = useString(toolbarItemReactionText)();
  const {width: windowWidth} = useWindowDimensions();
  const {rtcProps} = React.useContext(PropsContext);
  const {store, setStore} = React.useContext(StorageContext);
  const {
    data: {isHost},
  } = useRoomInfo();
  const buttonRef = React.useRef<any>(null);
  const [isTrayOpen, setIsTrayOpen] = React.useState(false);
  const [trayPosition, setTrayPosition] = React.useState<{
    top: number;
    left: number;
  } | null>(null);

  const tone: SkinTonePreference = store.liveReactionSkinTone ?? 'default';
  const setTone = React.useCallback(
    (next: SkinTonePreference) => {
      if (!setStore) {
        return;
      }
      setStore(prev => ({...prev, liveReactionSkinTone: next}));
    },
    [setStore],
  );

  if (!$config.ENABLE_LIVE_REACTIONS) {
    return null;
  }

  const isLiveStreamAudienceReactionDisabled =
    $config.EVENT_MODE &&
    $config.RAISE_HAND &&
    !isHost &&
    rtcProps.role === ClientRoleType.ClientRoleAudience;

  const closeTray = React.useCallback(() => {
    setIsTrayOpen(false);
    setTrayPosition(null);
  }, []);

  const openTray = React.useCallback(() => {
    const trayOffset = 12;

    requestAnimationFrame(() => {
      const button = buttonRef.current;
      if (!button?.measureInWindow) {
        setTrayPosition({top: 0, left: 0});
        setIsTrayOpen(true);
        return;
      }

      button.measureInWindow((x: number, y: number, buttonWidth: number) => {
        const left = Math.max(
          8,
          Math.min(
            windowWidth - TRAY_WIDTH - 8,
            x + buttonWidth / 2 - TRAY_WIDTH / 2,
          ),
        );
        const top = Math.max(8, y - TRAY_HEIGHT - trayOffset);

        setTrayPosition({top, left});
        setIsTrayOpen(true);
      });
    });
  }, [windowWidth]);

  const toggleTray = React.useCallback(() => {
    if (isTrayOpen) {
      closeTray();
    } else {
      openTray();
    }
  }, [closeTray, isTrayOpen, openTray]);

  const iconButtonProps: IconButtonProps = {
    hoverEffect: false,
    onPress: undefined,
    iconProps: {
      iconSize: iconSize || 24,
      name: 'add_reaction',
      tintColor: isLiveStreamAudienceReactionDisabled
        ? $config.SEMANTIC_NEUTRAL
        : $config.SECONDARY_ACTION_COLOR,
    },
    btnTextProps: {
      text:
        isOnActionSheet && isMobileUA()
          ? ''
          : isOnActionSheet
          ? label || reactionLabel
          : showLabel && rtcProps.callActive && !isMobileUA()
          ? label || reactionLabel
          : '',
      textColor: $config.FONT_COLOR,
    },
    containerStyle,
    isOnActionSheet,
    disabled: isLiveStreamAudienceReactionDisabled,
  };

  if (isOnActionSheet) {
    iconButtonProps.btnTextProps.textStyle = {
      color: $config.FONT_COLOR,
      marginTop: 8,
      fontSize: 12,
      fontWeight: '400',
      fontFamily: 'Source Sans Pro',
      textAlign: 'center',
    };
  }

  iconButtonProps.onPress = isLiveStreamAudienceReactionDisabled
    ? undefined
    : toggleTray;

  const tray = (
    <ReactionTray
      tone={tone}
      setTone={setTone}
      onSelect={reaction => {
        emitLiveReaction(reaction);
      }}
    />
  );

  return (
    <>
      <IconButton
        {...iconButtonProps}
        setRef={(ref: any) => {
          buttonRef.current = ref;
        }}
      />
      <Modal
        transparent
        visible={isTrayOpen}
        animationType="none"
        onRequestClose={closeTray}>
        <View style={styles.modalRoot}>
          <TouchableWithoutFeedback onPress={closeTray}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          {trayPosition ? (
            <View style={[styles.trayPortal, trayPosition]}>{tray}</View>
          ) : null}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  tray: {
    width: TRAY_WIDTH,
    height: TRAY_HEIGHT,
    padding: 8,
    marginBottom: 12,
    borderRadius: 24,
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 1000,
  },
  toneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor:
      $config.HARD_CODED_BLACK_COLOR + '22',
  },
  toneButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toneButtonSelected: {
    backgroundColor:
      $config.SECONDARY_ACTION_COLOR + '33',
  },
  toneEmoji: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    includeFontPadding: false,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalRoot: {
    flex: 1,
    position: 'relative',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  trayPortal: {
    position: 'absolute',
    zIndex: 1001,
  },
  reactionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  reactionEmoji: {
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default LiveReactionButton;

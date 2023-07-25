import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import React from 'react';

import Caption from './Caption';
import {useCaption} from './useCaption';
import ThemeConfig from '../../../src/theme';
import {calculatePosition, isMobileUA, useIsDesktop} from '../../utils/common';
import IconButton from '../../../src/atoms/IconButton';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import ActionMenu, {ActionMenuItem} from '../../../src/atoms/ActionMenu';
import {useSidePanel, SidePanelType} from 'customization-api';
import LanguageSelectorPopup from './LanguageSelectorPopup';
import useSTTAPI from './useSTTAPI';
import events, {EventPersistLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import useGetName from '../../utils/useGetName';
import {useMeetingInfo} from 'customization-api';
import {
  SIDE_PANEL_MAX_WIDTH,
  SIDE_PANEL_GAP,
  SIDE_PANEL_MIN_WIDTH,
  CAPTION_CONTAINER_HEIGHT,
} from '../../../src/components/CommonStyles';
import useCaptionWidth from './useCaptionWidth';
import {LanguageType} from './utils';

const CaptionContainer = () => {
  const {captionObj, setCaptionObj} = useCaption();
  const moreIconRef = React.useRef<View>(null);
  const [actionMenuVisible, setActionMenuVisible] =
    React.useState<boolean>(false);
  const isDesktop = useIsDesktop();
  const {sidePanel} = useSidePanel();
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();

  const {isCaptionNotFullWidth} = useCaptionWidth();
  return (
    <View
      style={[
        {
          paddingLeft: isMobileUA() ? 0 : isDesktop() ? 32 : 10,
          paddingRight: isMobileUA()
            ? 0
            : isDesktop()
            ? globalWidth > 1700 && isCaptionNotFullWidth
              ? 20
              : 32
            : 10,
        },
        isCaptionNotFullWidth && {
          maxWidth: `calc(100% - ${SIDE_PANEL_MAX_WIDTH} - ${SIDE_PANEL_GAP}px )`,
          width: `calc(100% - ${SIDE_PANEL_MIN_WIDTH}px - ${SIDE_PANEL_GAP}px )`,
        },
      ]}>
      <View
        style={[
          !isDesktop() ? styles.mobileContainer : styles.container,
          isMobileUA() && {marginHorizontal: 0},
        ]}>
        <CaptionsActionMenu
          actionMenuVisible={actionMenuVisible}
          setActionMenuVisible={setActionMenuVisible}
          btnRef={moreIconRef}
        />

        <MoreMenu
          ref={moreIconRef}
          setActionMenuVisible={setActionMenuVisible}
        />

        <Caption />
      </View>
    </View>
  );
};

interface MoreMenuProps {
  setActionMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const MoreMenu = React.forwardRef<View, MoreMenuProps>((props, ref) => {
  const {setActionMenuVisible} = props;
  const isMobile = isMobileUA();
  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        width: 32,
        height: 32,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        position: 'absolute',
        right: 8,
        top: 8,
        zIndex: 999,
      }}>
      <IconButton
        hoverEffect={true}
        hoverEffectStyle={{
          backgroundColor: $config.VIDEO_AUDIO_TILE_OVERLAY_COLOR,
          borderRadius: 20,
        }}
        iconProps={{
          iconType: 'plain',
          name: 'more-menu',
          iconSize: isMobile ? 18 : 20,
          tintColor: $config.SECONDARY_ACTION_COLOR,
          iconContainerStyle: {
            padding: isMobile ? 6 : 8,
            borderRadius: 20,
            backgroundColor: isMobile
              ? $config.VIDEO_AUDIO_TILE_OVERLAY_COLOR
              : 'transparent',
          },
        }}
        onPress={() => {
          setActionMenuVisible(true);
        }}
      />
    </View>
  );
});

interface CaptionsActionMenuProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: (actionMenuVisible: boolean) => void;
  btnRef: React.RefObject<View>;
}

const CaptionsActionMenu = (props: CaptionsActionMenuProps) => {
  const {actionMenuVisible, setActionMenuVisible, btnRef} = props;
  const {setSidePanel} = useSidePanel();
  const {setIsCaptionON, language, isLangChangeInProgress, setLanguage} =
    useCaption();
  const actionMenuitems: ActionMenuItem[] = [];
  const [modalPosition, setModalPosition] = React.useState({});
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);
  const {restart} = useSTTAPI();
  const username = useGetName();
  const {
    data: {isHost},
  } = useMeetingInfo();

  // only Host is authorized to start/stop stt
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
    icon: 'caption-off',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: 'Turn Off Captions ',
    callback: () => {
      setActionMenuVisible(false);
      setIsCaptionON(false);
    },
  });

  const onLanguageChange = (langChanged = false, language: LanguageType[]) => {
    setLanguagePopup(false);
    if (langChanged) {
      setLanguage(() => language);
      restart()
        .then(() => {
          console.log('stt restarted successfully');
          //notify others lang changed
          events.send(
            EventNames.STT_LANGUAGE,
            JSON.stringify({username, language}),
            EventPersistLevel.LEVEL3,
          );
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
        from={'caption'}
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

export default CaptionContainer;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    height: CAPTION_CONTAINER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
  },
  mobileContainer: {
    padding: 12,
    height: 120,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
    marginTop: 16,
  },
});

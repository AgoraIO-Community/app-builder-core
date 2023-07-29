import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import React from 'react';

import Caption from './Caption';
import {useCaption} from './useCaption';
import ThemeConfig from '../../../src/theme';
import {
  calculatePosition,
  isMobileUA,
  isWeb,
  isWebInternal,
  useIsDesktop,
  useIsSmall,
} from '../../utils/common';
import IconButton from '../../../src/atoms/IconButton';

import ActionMenu, {ActionMenuItem} from '../../../src/atoms/ActionMenu';

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
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';

const CaptionContainer = () => {
  const moreIconRef = React.useRef<View>(null);
  const [actionMenuVisible, setActionMenuVisible] =
    React.useState<boolean>(false);
  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const isDesktop = useIsDesktop();
  const isSmall = useIsSmall();
  const {isLangChangeInProgress} = useCaption();

  const {width: globalWidth, height: globalHeight} = useWindowDimensions();

  const {isCaptionNotFullWidth} = useCaptionWidth();

  return (
    <PlatformWrapper isHovered={isHovered} setIsHovered={setIsHovered}>
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
            !isMobileUA() && isSmall() && {marginTop: 0},
          ]}>
          <CaptionsActionMenu
            actionMenuVisible={actionMenuVisible}
            setActionMenuVisible={setActionMenuVisible}
            btnRef={moreIconRef}
          />

          {(isHovered || isMobileUA()) && !isLangChangeInProgress && (
            <MoreMenu
              ref={moreIconRef}
              setActionMenuVisible={setActionMenuVisible}
            />
          )}

          <Caption />
        </View>
      </View>
    </PlatformWrapper>
  );
};

const PlatformWrapper = ({children, setIsHovered, isHovered}) => {
  return isWebInternal() && !isMobileUA() ? (
    <div
      onMouseOver={() => {
        !isHovered && setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}>
      {children}
    </div>
  ) : (
    <>{children}</>
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
          backgroundColor:
            $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['25%'],
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
              ? $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['25%']
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
  const {
    setIsCaptionON,
    language: prevLang,
    isLangChangeInProgress,
    setLanguage,
  } = useCaption();
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
    icon: 'captions-off',
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
    paddingVertical: 12,
    paddingHorizontal: 20,
    height: CAPTION_CONTAINER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'white',
  },
  mobileContainer: {
    padding: 12,
    height: 120,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'white',
  },
});

import {
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';

import SonioxCaption from './SonioxCaption';
import {useSonioxCaption} from './useSonioxCaption';
import ThemeConfig from '../../../../src/theme';
import {
  calculatePosition,
  isMobileUA,
  isWeb,
  isWebInternal,
  useIsDesktop,
  useIsSmall,
} from '../../../utils/common';
import IconButton from '../../../../src/atoms/IconButton';

import ActionMenu, {ActionMenuItem} from '../../../../src/atoms/ActionMenu';

import LanguageSelectorPopup from '../LanguageSelectorPopup';
import useSonioxSTTAPI from './useSonioxSTTAPI';
import useGetName from '../../../utils/useGetName';
import {useRoomInfo} from 'customization-api';
import {useLocalUid} from '../../../../agora-rn-uikit';
import {getLanguageLabel} from '../utils';
import {
  SIDE_PANEL_MAX_WIDTH,
  SIDE_PANEL_GAP,
  SIDE_PANEL_MIN_WIDTH,
  CAPTION_CONTAINER_HEIGHT,
  MOBILE_CAPTION_CONTAINER_HEIGHT,
} from '../../../../src/components/CommonStyles';
import useCaptionWidth from '../useCaptionWidth';
import {LanguageType, langData, mergeTranslationConfigs} from '../utils';
import hexadecimalTransparency from '../../../utils/hexadecimalTransparency';
import {useString} from '../../../utils/useString';
import {
  sttChangeSpokenLanguageText,
  toolbarItemCaptionText,
} from '../../../language/default-labels/videoCallScreenLabels';
import {logger, LogSource} from '../../../logger/AppBuilderLogger';

interface SonioxCaptionContainerProps {
  containerStyle?: ViewStyle;
  captionUserStyle?: TextStyle;
  captionTextStyle?: TextStyle;
}

const SonioxCaptionContainer: React.FC<SonioxCaptionContainerProps> = ({
  containerStyle = {},
  captionUserStyle = {},
  captionTextStyle = {},
}) => {
  const moreIconRef = React.useRef<View>(null);
  const langSelectIconRef = React.useRef<View>(null);
  const [actionMenuVisible, setActionMenuVisible] =
    React.useState<boolean>(false);
  const [langActionMenuVisible, setLangActionMenuVisible] =
    React.useState<boolean>(false);
  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const isDesktop = useIsDesktop();
  const isSmall = useIsSmall();
  const {isLangChangeInProgress, isCaptionON} = useSonioxCaption();

  const {width: globalWidth, height: globalHeight} = useWindowDimensions();

  const {isCaptionNotFullWidth} = useCaptionWidth();
  if (!isCaptionON) return <></>;

  return (
    <PlatformWrapper isHovered={isHovered} setIsHovered={setIsHovered}>
      <View
        style={[
          {
            paddingLeft: isMobileUA()
              ? 0
              : isDesktop()
              ? $config.ICON_TEXT
                ? 32
                : 0
              : 10,
            paddingRight: isMobileUA()
              ? 0
              : isDesktop()
              ? globalWidth > 1700 && isCaptionNotFullWidth
                ? $config.ICON_TEXT
                  ? 20
                  : 0
                : $config.ICON_TEXT
                ? 32
                : 0
              : 10,
          },
          //@ts-ignore
          isCaptionNotFullWidth && {
            maxWidth: `calc(100% - ${SIDE_PANEL_MAX_WIDTH} - ${
              SIDE_PANEL_GAP + 1
            }px )`,
            width: `calc(100% - ${SIDE_PANEL_MIN_WIDTH}px - ${
              SIDE_PANEL_GAP + 1
            }px )`,
          },
        ]}>
        <View
          style={[
            isMobileUA() ? styles.mobileContainer : styles.container,
            isMobileUA() && {marginHorizontal: 0},
            !isMobileUA() && isSmall() && {marginTop: 0},
            // Green border to distinguish Soniox
            {
              borderWidth: 2,
              borderColor: '#4CAF50', // Green border for Soniox
            },
            containerStyle,
          ]}>
          <SonioxCaptionsActionMenu
            actionMenuVisible={actionMenuVisible}
            setActionMenuVisible={setActionMenuVisible}
            btnRef={moreIconRef}
          />

          <SonioxTranslateActionMenu
            actionMenuVisible={langActionMenuVisible}
            setActionMenuVisible={setLangActionMenuVisible}
            btnRef={langSelectIconRef}
          />

          {(isHovered || isMobileUA()) && !isLangChangeInProgress && (
            <>
              <LanguageSelectMenu
                ref={langSelectIconRef}
                setActionMenuVisible={setLangActionMenuVisible}
              />
              <MoreMenu
                ref={moreIconRef}
                setActionMenuVisible={setActionMenuVisible}
              />
            </>
          )}

          <SonioxCaption
            captionUserStyle={captionUserStyle}
            captionTextStyle={captionTextStyle}
          />
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
        right: isMobile ? 3 : 8,
        top: isMobile ? 3 : 8,
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

const LanguageSelectMenu = React.forwardRef<View, MoreMenuProps>(
  (props, ref) => {
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
          right: isMobile ? 45 : 50,
          top: isMobile ? 3 : 8,
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
            name: 'lang-select',
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
  },
);

interface SonioxCaptionsActionMenuProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: (actionMenuVisible: boolean) => void;
  btnRef: React.RefObject<View>;
}

const SonioxCaptionsActionMenu = (props: SonioxCaptionsActionMenuProps) => {
  const {actionMenuVisible, setActionMenuVisible, btnRef} = props;
  const {
    setIsCaptionON,
    language: prevLang,
    isLangChangeInProgress,
    setLanguage,
    selectedTranslationLanguage
  } = useSonioxCaption();
  const actionMenuitems: ActionMenuItem[] = [];
  const [modalPosition, setModalPosition] = React.useState({});
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);
  const {restart} = useSonioxSTTAPI();
  const username = useGetName();
  const {
    data: {isHost},sttLanguage
  } = useRoomInfo();

  const changeSpokenLangLabel = useString<boolean>(
    sttChangeSpokenLanguageText,
  )();

  const hideCaptionLabel = useString<boolean>(toolbarItemCaptionText)(true);

  // only Host is authorized to start/stop stt
  isHost &&
    actionMenuitems.push({
      icon: 'lang-select',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: changeSpokenLangLabel + ' (Soniox)',
      disabled: isLangChangeInProgress,
      onPress: () => {
        setActionMenuVisible(false);
        setLanguagePopup(true);
      },
    });

  actionMenuitems.push({
    icon: 'captions-off',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: 'Hide Caption 2',
    onPress: () => {
      setActionMenuVisible(false);
      setIsCaptionON(false);
    },
  });

  const onLanguageChange = (
    langChanged = false,
    allLanguages: LanguageType[],
    userOwnLanguages?: LanguageType[],
  ) => {
    console.log(`SonioxCaptionContainer - onLanguageChange - selectedTranslationLanguage, sttLanguage:`, selectedTranslationLanguage, sttLanguage);
    setLanguagePopup(false);
    if (langChanged) {
      logger.log(
        LogSource.Internals,
        'Soniox-STT',
        `Language changed to  ${allLanguages}. Restarting Soniox STT`,
      );
      
      // If user has translation selected, we need to merge translation configs
      let translateConfigToPass = null;
      
      if (selectedTranslationLanguage && selectedTranslationLanguage !== '') {
        // Get existing translate config from room state
        const existingTranslateConfig = sttLanguage?.translateConfig || [];

        // Use utility function to merge translation configs
        const mergedTranslateConfig = mergeTranslationConfigs(
          existingTranslateConfig,
          userOwnLanguages || [],
          selectedTranslationLanguage,
        );

        translateConfigToPass = {
          translate_config: mergedTranslateConfig,
          userSelectedTranslation: selectedTranslationLanguage,
        };
      }

      // Pass translation config to restart if available
      restart(allLanguages, userOwnLanguages, translateConfigToPass)
        .then(() => {
          logger.debug(
            LogSource.Internals,
            'Soniox-STT',
            'soniox stt restarted successfully',
          );
        })
        .catch(error => {
          logger.error(
            LogSource.Internals,
            'Soniox-STT',
            'Error in restarting soniox',
            error,
          );
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
        from={'soniox-caption'}
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

export interface SonioxTranslateActionMenuProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: (actionMenuVisible: boolean) => void;
  btnRef: React.RefObject<View>;
}

export const SonioxTranslateActionMenu = (props: SonioxTranslateActionMenuProps) => {
  const {actionMenuVisible, setActionMenuVisible, btnRef} = props;
  const [modalPosition, setModalPosition] = React.useState({});
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const {
    language: currentSpokenLanguages,
    selectedTranslationLanguage,
    setSelectedTranslationLanguage,
    setMeetingTranscript,
  } = useSonioxCaption();
  const {update} = useSonioxSTTAPI();
  const localUid = useLocalUid();
  const {sttLanguage} = useRoomInfo();

  const actionMenuitems: ActionMenuItem[] = [];

  actionMenuitems.push({
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: 'Translate to (Soniox)',
    iconPosition: 'end',
    disabled: true,
    onPress: () => {},
  });

  const handleTranslationToggle = async (targetLanguage: string) => {
    try {
      const prevTranslationLanguage = selectedTranslationLanguage;

      if (targetLanguage === '') {
        // turn off translation - todo test
        await update({
          translate_config: [],
          lang: currentSpokenLanguages,
          userSelectedTranslation: '', // Empty string for "off"
        });
        setSelectedTranslationLanguage('');
      } else {
        // Get existing translate config from room state
        const existingTranslateConfig = sttLanguage?.translateConfig || [];

        // Use utility function to merge translation configs
        const mergedTranslateConfig = mergeTranslationConfigs(
          existingTranslateConfig,
          currentSpokenLanguages,
          targetLanguage,
        );

        await update({
          translate_config: mergedTranslateConfig,
          lang: currentSpokenLanguages,
          userSelectedTranslation: targetLanguage,
        });
        setSelectedTranslationLanguage(targetLanguage);
      }

      // Add translation language change notification to transcript
      const getLanguageName = (langCode: string) => {
        if (!langCode) return '';
        const lang = langData.find(data => data.value === langCode);
        return lang ? lang.label : langCode;
      };

      const actionText =
        targetLanguage === ''
          ? 'turned off translation (Soniox)'
          : prevTranslationLanguage === ''
          ? `set the translation language to "${getLanguageName(
              targetLanguage,
            )}" (Soniox)`
          : `changed the translation language from "${getLanguageName(
              prevTranslationLanguage,
            )}" to "${getLanguageName(targetLanguage)}" (Soniox)`;

      setMeetingTranscript(prev => [
        ...prev,
        {
          name: 'translationUpdate',
          time: new Date().getTime(),
          uid: `translationUpdate-${localUid}-soniox`,
          text: actionText,
        },
      ]);

      setActionMenuVisible(false);
    } catch (error) {
      logger.error(
        LogSource.Internals,
        'Soniox-STT',
        'Failed to update soniox translation configuration',
        error,
      );
    }
  };

  actionMenuitems.push({
    icon: selectedTranslationLanguage === '' ? 'tick-fill' : undefined,
    iconColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    textColor: $config.FONT_COLOR,
    title: 'Off',
    iconPosition: 'end',
    onPress: () => handleTranslationToggle(''),
  });

  // Add Translation language options
  langData.forEach(language => {
    actionMenuitems.push({
      icon:
        selectedTranslationLanguage === language.value
          ? 'tick-fill'
          : undefined,
      iconColor: $config.PRIMARY_ACTION_BRAND_COLOR,
      textColor: $config.FONT_COLOR,
      title: language.label,
      iconPosition: 'end',
      onPress: () => handleTranslationToggle(language.value),
    });
  });

  React.useEffect(() => {
    if (actionMenuVisible) {
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
    <ActionMenu
      from={'soniox-translation'}
      actionMenuVisible={actionMenuVisible && isPosCalculated}
      setActionMenuVisible={setActionMenuVisible}
      modalPosition={modalPosition}
      items={actionMenuitems}
      containerStyle={{
        maxHeight: Math.min(440, globalHeight * 0.6),
        width: 220,
      }}
    />
  );
};

export default SonioxCaptionContainer;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
    paddingHorizontal: 20,
    height: CAPTION_CONTAINER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
    marginTop: $config.ICON_TEXT ? 8 : 0,
  },
  mobileContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    height: MOBILE_CAPTION_CONTAINER_HEIGHT,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
    marginTop: 8,
  },
});
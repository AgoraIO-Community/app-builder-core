import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import React from 'react';

import Caption from './Caption';
import {useCaption} from './useCaption';
import ThemeConfig from '../../../src/theme';
import {calculatePosition, isMobileUA, useIsDesktop} from '../../utils/common';
import IconButton from '../../../src/atoms/IconButton';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import ActionMenu, {ActionMenuItem} from '../../../src/atoms/ActionMenu';
import {SidePanelType, useRender, useSidePanel} from 'customization-api';
import LanguageSelectorPopup, {getLanguageLabel} from './LanguageSelectorPopup';
import useSTTAPI from './useSTTAPI';
import events, {EventPersistLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import useGetName from '../../utils/useGetName';
import {useMeetingInfo} from 'customization-api';

const CaptionContainer = () => {
  const {isCaptionON, setIsCaptionON} = useCaption();
  const moreIconRef = React.useRef<View>(null);
  const {renderList} = useRender();
  const [actionMenuVisible, setActionMenuVisible] =
    React.useState<boolean>(false);
  const renderListRef = React.useRef({renderList});
  const isDesktop = useIsDesktop();
  const {
    data: {isHost},
  } = useMeetingInfo();

  React.useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  return isCaptionON ? (
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
      {isHost && (
        <MoreMenu
          ref={moreIconRef}
          setActionMenuVisible={setActionMenuVisible}
        />
      )}
      <Caption renderListRef={renderListRef} />
    </View>
  ) : null;
};

interface MoreMenuProps {
  setActionMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const MoreMenu = React.forwardRef<View, MoreMenuProps>((props, ref) => {
  const {setActionMenuVisible} = props;
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
          backgroundColor: $config.ICON_BG_COLOR,
          borderRadius: 20,
          padding: 6,
        }}
        iconProps={{
          iconType: 'plain',
          name: 'more-menu',
          iconSize: 18,
          tintColor: $config.SECONDARY_ACTION_COLOR,
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
  const {setIsCaptionON, language} = useCaption();
  const actionMenuitems: ActionMenuItem[] = [];
  const [modalPosition, setModalPosition] = React.useState({});
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const [isLanguagePopupOpen, setLanguagePopup] =
    React.useState<boolean>(false);
  const {restart} = useSTTAPI();
  const username = useGetName();

  actionMenuitems.push({
    icon: 'lang-select',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: 'Change Spoken Language ',
    callback: () => {
      setActionMenuVisible(false);
      setLanguagePopup(true);
    },
  });

  // actionMenuitems.push({
  //   icon: 'transcript-mode', //TODO: update show transcript icon
  //   iconColor: $config.SECONDARY_ACTION_COLOR,
  //   textColor: $config.FONT_COLOR,
  //   title: 'Show Transcript',
  //   callback: () => {
  //     setActionMenuVisible(false);
  //     setIsCaptionON(false);
  //     setSidePanel(SidePanelType.Transcript);
  //   },
  // });
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

  const onLanguageChange = (langChanged = false) => {
    setLanguagePopup(false);
    if (langChanged) {
      restart()
        .then(() => {
          console.log('stt restarted successfully');
          //notify others lang changed
          events.send(
            EventNames.STT_LANGUAGE,
            JSON.stringify({username, language}),
            EventPersistLevel.LEVEL3,
          );
          setLanguagePopup(false);
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
    paddingVertical: 15,
    height: 132,
    marginHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
  },
  mobileContainer: {
    marginHorizontal: 10,
    padding: 12,
    height: 120,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderRadius: ThemeConfig.BorderRadius.small,
  },
});

import {Text, View, StyleSheet, LayoutChangeEvent} from 'react-native';
import React from 'react';

import ThemeConfig from '../../../src/theme';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import {isMobileUA} from '../../utils/common';
import {CAPTION_CONTAINER_HEIGHT} from 'src/components/CommonStyles';
import {useCaption} from './useCaption';

interface CaptionTextProps {
  user: string;
  value: string;
  activeSpeakersCount: number;
  isActiveSpeaker?: boolean;
  activeContainerFlex: number;
  setActiveContainerFlex: React.Dispatch<React.SetStateAction<number>>;
  activelinesAvailable: number;
  setActiveLinesAvailable: React.Dispatch<React.SetStateAction<number>>;
}

const DESKTOP_LINE_HEIGHT = 28;
const MOBILE_LINE_HEIGHT = 19; // TO VERIFY

const CaptionText = ({
  user,
  value,
  activeSpeakersCount,
  isActiveSpeaker = false,
  activeContainerFlex,
  setActiveContainerFlex,
  activelinesAvailable,
  setActiveLinesAvailable,
}: CaptionTextProps) => {
  const isMobile = isMobileUA();

  const [captionContainerHeight, setCaptionContainerHeight] = React.useState(
    () => (isMobile ? MOBILE_LINE_HEIGHT : DESKTOP_LINE_HEIGHT),
  );
  const activeLinesRef = React.useRef(1);
  const preActiveLinesRef = React.useRef(1);

  const LINE_HEIGHT = isMobile ? MOBILE_LINE_HEIGHT : DESKTOP_LINE_HEIGHT;

  // callback triggers whenevere captions reaches next line
  const handleTextLayout = (event: LayoutChangeEvent) => {
    const textHeight = event.nativeEvent.layout.height; // height of the <Text>
    const currentLines = Math.floor(textHeight / LINE_HEIGHT); // calculate numberOfLines

    if (isActiveSpeaker) {
      activeLinesRef.current = Math.min(currentLines, 3); // setting activeUser Lines
    } else {
      preActiveLinesRef.current = Math.min(currentLines, 3); // setting in-activeUser Lines
    }

    // max caption lines means how many lines can be accomadated: Max 3 for 1 speaker and 2 for 2 speakers
    const MaxLines =
      activeSpeakersCount === 1
        ? 3
        : isActiveSpeaker
        ? activeLinesRef.current
        : 3 - activeLinesRef.current;

    const currentActiveLines = Math.min(currentLines, MaxLines);

    if (isActiveSpeaker && activeSpeakersCount !== 1) {
      setActiveContainerFlex(
        activeSpeakersCount === 1 ? 1 : (currentActiveLines + 1) * 0.2, // total 5 lines (3 caption + 2 name tag) so 1 line will take 1/5 =>0.2
      );
    }

    if (isActiveSpeaker) {
      setActiveLinesAvailable(currentActiveLines);
    }

    if (isActiveSpeaker && activeSpeakersCount !== 1 && currentLines >= 3) {
      setActiveContainerFlex(() => 1);
    }
  };

  return (
    <View style={[styles.captionContainer, {flex: activeContainerFlex}]}>
      <Text
        style={[
          styles.captionUserName,
          isMobile ? styles.mobileNameFontSize : styles.desktopNameFontSize,
          {color: isActiveSpeaker ? 'yellow' : 'white'},
        ]}
        numberOfLines={1}
        textBreakStrategy="simple"
        ellipsizeMode="tail">
        {user}
      </Text>
      <View
        style={[
          styles.captionTextContainerStyle,
          {
            height:
              (isActiveSpeaker
                ? activelinesAvailable
                : Math.min(activelinesAvailable, preActiveLinesRef.current)) *
              LINE_HEIGHT,
          },
        ]}>
        <Text
          onLayout={handleTextLayout}
          style={[
            styles.captionText,
            isMobile
              ? styles.mobileCaptionFontSize
              : styles.desktopCaptionFontSize,
          ]}>
          {value}
        </Text>
      </View>
    </View>
  );
};

export default CaptionText;

const styles = StyleSheet.create({
  captionContainer: {
    alignItems: 'flex-start',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 620,
    justifyContent: 'flex-end',
    // borderWidth: 1,
    borderStyle: 'dotted',
  },

  captionTextContainerStyle: {
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
  },

  captionText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    color: $config.FONT_COLOR,
    position: 'absolute',
    bottom: 0,
  },

  captionUserName: {
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    color: $config.FONT_COLOR + hexadecimalTransparency['70%'],
    fontSize: ThemeConfig.FontSize.medium,
    lineHeight: 22,
    maxWidth: 200,
  },
  mobileNameFontSize: {
    fontSize: 16,
    lineHeight: 19,
  },
  desktopNameFontSize: {
    fontSize: 18,
    lineHeight: 22,
  },
  mobileCaptionFontSize: {
    fontSize: 16,
    lineHeight: 19,
  },
  desktopCaptionFontSize: {
    fontSize: 24,
    lineHeight: 28,
  },
});

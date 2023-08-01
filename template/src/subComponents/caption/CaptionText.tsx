import {Text, View, StyleSheet, LayoutChangeEvent} from 'react-native';
import React from 'react';

import ThemeConfig from '../../../src/theme';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import {isMobileUA} from '../../utils/common';
import {CAPTION_CONTAINER_HEIGHT} from 'src/components/CommonStyles';

interface CaptionTextProps {
  user: string;
  value: string;
  activeSpeakersCount: number;
  isActiveSpeaker?: boolean;
  activeContainerFlex: number;
  setActiveContainerFlex: React.Dispatch<React.SetStateAction<number>>;
}

const DESKTOP_LINE_HEIGHT = 28;
const MOBILE_LINE_HEIGHT = 24; // TO VERIFY

export const CaptionText = ({
  user,
  value,
  activeSpeakersCount,
  isActiveSpeaker = false,
  activeContainerFlex,
  setActiveContainerFlex,
}: CaptionTextProps) => {
  const isMobile = isMobileUA();
  const mobileCaptionHeight = activeSpeakersCount === 1 ? 90 : 45;
  const desktopCaptionHeight = activeSpeakersCount === 1 ? 108 : 54;
  // as user speaks continously previous captions should be hidden , new appended

  const flexRef = React.useRef(0.4);

  const [captionContainerHeight, setCaptionContainerHeight] = React.useState(
    () => (isMobile ? MOBILE_LINE_HEIGHT : DESKTOP_LINE_HEIGHT),
  );
  const [containerFlex, setContainerFlex] = React.useState(1);
  const handleTextLayout = (event: LayoutChangeEvent) => {
    const textHeight = event.nativeEvent.layout.height;
    // max caption lines 3 for 1 user
    // max caption lines for active speaker 2 when 2 users
    const MaxLines = activeSpeakersCount === 1 ? 3 : isActiveSpeaker ? 2 : 1;
    const currentLines = Math.floor(textHeight / DESKTOP_LINE_HEIGHT); //TODO: for mobile
    const allowedCurrentLines = Math.min(currentLines, MaxLines);
    const flex =
      activeSpeakersCount === 1
        ? 1
        : isActiveSpeaker
        ? (allowedCurrentLines + 1) * 0.2
        : 1 - flexRef.current;

    if (isActiveSpeaker) {
      setActiveContainerFlex(
        activeSpeakersCount === 1 ? 1 : (allowedCurrentLines + 1) * 0.2, // total 5 lines (3 caption + 2 name tag) so 1 line will take 1/5 =>0.2
      );
    }

    setCaptionContainerHeight(
      () => Math.min(textHeight, DESKTOP_LINE_HEIGHT * MaxLines) - 1,
      // 1 is subtracted from line height to avoid hindi charcters when scrolled up
    );
  };

  return (
    <View
      style={[
        styles.captionContainer,
        {borderColor: isActiveSpeaker ? 'yellow' : 'pink'},
        {flex: activeContainerFlex},
      ]}>
      <Text
        style={[
          styles.captionUserName,
          isMobile ? styles.mobileNameFontSize : styles.desktopNameFontSize,
        ]}
        numberOfLines={1}
        textBreakStrategy="simple"
        ellipsizeMode="tail">
        {user}
      </Text>
      <View
        style={[
          styles.captionTextContainerStyle,
          {height: captionContainerHeight},
        ]}>
        <Text
          onLayout={handleTextLayout}
          style={[
            styles.captionText,
            isMobile
              ? styles.mobileCaptionFontSize
              : styles.edsktopCaptionFontSize,
          ]}>
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  captionContainer: {
    alignItems: 'flex-start',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 620,
    justifyContent: 'flex-end',
    //   borderWidth: 1,
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
    fontSize: 14,
    lineHeight: 18,
  },
  desktopNameFontSize: {
    fontSize: 18,
    lineHeight: 22,
  },
  mobileCaptionFontSize: {
    fontSize: 16,
    lineHeight: 22,
  },
  edsktopCaptionFontSize: {
    fontSize: 24,
    lineHeight: 28,
  },
});

import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {useCaption} from './useCaption';
import {useSonioxCaption} from './soniox/useSonioxCaption';
import CaptionContainer from './CaptionContainer';
import SonioxCaptionContainer from './soniox/SonioxCaptionContainer';
import {useIsDesktop} from '../../utils/common';

interface DualCaptionContainerProps {
  containerStyle?: any;
  captionUserStyle?: any;
  captionTextStyle?: any;
}

const DualCaptionContainer: React.FC<DualCaptionContainerProps> = ({
  containerStyle = {},
  captionUserStyle = {},
  captionTextStyle = {},
}) => {
  const {isCaptionON: isAzureCaptionON} = useCaption();
  const {isCaptionON: isSonioxCaptionON} = useSonioxCaption();
  const isDesktop = useIsDesktop();

  // If neither caption is on, don't render anything
  if (!isAzureCaptionON && !isSonioxCaptionON) {
    return <></>;
  }

  // If only one caption is on, show it full width
  if (isAzureCaptionON && !isSonioxCaptionON) {
    return (
      <CaptionContainer
        containerStyle={containerStyle}
        captionUserStyle={captionUserStyle}
        captionTextStyle={captionTextStyle}
      />
    );
  }

  if (!isAzureCaptionON && isSonioxCaptionON) {
    return (
      <SonioxCaptionContainer
        containerStyle={containerStyle}
        captionUserStyle={captionUserStyle}
        captionTextStyle={captionTextStyle}
      />
    );
  }

  // If both captions are on, show them side by side on desktop, stacked on mobile
  return (
    <View style={[
      isDesktop() ? styles.dualContainerDesktop : styles.dualContainerMobile,
      containerStyle
    ]}>
      {/* Azure Caption (Caption 1) */}
      <View style={isDesktop() ? styles.captionHalf : styles.captionFull}>
        <View style={styles.captionLabelContainer}>
          <Text style={styles.captionLabel}>Caption 1 (Azure)</Text>
        </View>
        <CaptionContainer
          containerStyle={{marginTop: 0}}
          captionUserStyle={captionUserStyle}
          captionTextStyle={captionTextStyle}
        />
      </View>

      {/* Soniox Caption (Caption 2) */}
      <View style={isDesktop() ? styles.captionHalf : styles.captionFull}>
        <View style={styles.captionLabelContainer}>
          <Text style={styles.captionLabel}>Caption 2 (Soniox)</Text>
        </View>
        <SonioxCaptionContainer
          containerStyle={{marginTop: 0}}
          captionUserStyle={captionUserStyle}
          captionTextStyle={captionTextStyle}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dualContainerDesktop: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  dualContainerMobile: {
    flexDirection: 'column',
    width: '100%',
    gap: 8,
  },
  captionHalf: {
    flex: 1,
  },
  captionFull: {
    width: '100%',
  },
  captionLabelContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderRadius: 4,
    marginBottom: 4,
  },
  captionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: $config.FONT_COLOR,
    textAlign: 'center',
  },
});

export default DualCaptionContainer;
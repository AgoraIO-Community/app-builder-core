import {
  StyleSheet,
  Image,
  View,
  Pressable,
  Text,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useRef, useState} from 'react';
import ImageIcon from '../atoms/ImageIcon';
import ThemeConfig from '../theme';

interface InfoBubbleProps {
  text: string;
}

const InfoBubble = (props: InfoBubbleProps) => {
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const [left, setLeft] = useState(0);

  const tooltipRef = useRef(null);
  const iconRef = useRef(null);

  return (
    <>
      <div
        style={{
          position: 'relative',
          marginTop: -3,
          marginLeft: -3,
          background: toolTipVisible
            ? $config.CARD_LAYER_5_COLOR + '20'
            : 'transparent',
          width: 28,
          height: 28,
          borderRadius: '50%',
        }}
        onMouseEnter={() => {
          setToolTipVisible(true);
        }}
        onMouseLeave={() => {
          setToolTipVisible(false);
        }}
        ref={iconRef}>
        {toolTipVisible ? (
          <>
            <View
              style={[
                styles.textContainer,
                {left: left + 5},
                {opacity: !left ? 0 : 1},
              ]}
              onLayout={({
                nativeEvent: {
                  layout: {x, y, width, height},
                },
              }) => {
                //To center align the tooltip above the icons
                if (!left) setLeft(-(width / 2));
              }}
              ref={tooltipRef}>
              <Text style={styles.textStyle} numberOfLines={1}>
                {props.text}
              </Text>
            </View>
            <View style={styles.downsideTriangleIconContainer}>
              <ImageIcon
                customSize={{
                  width: styles.downsideTriangleIcon.width,
                  height: styles.downsideTriangleIcon.height,
                }}
                name={'downside-triangle'}
                tintColor={$config.CARD_LAYER_3_COLOR}
              />
            </View>
          </>
        ) : (
          <></>
        )}
        <View style={styles.iconStyleView}>
          <ImageIcon
            iconSize="medium"
            name={'info'}
            tintColor={$config.SEMANTIC_NETRUAL}
          />
        </View>
      </div>
    </>
  );
};

export default InfoBubble;

const styles = StyleSheet.create({
  iconStyleView: {
    marginTop: 4,
    marginLeft: 4,
  },
  downsideTriangleIconContainer: {
    position: 'absolute',
    top: -24,
    left: -2,
    zIndex: 999,
  },
  downsideTriangleIcon: {
    width: 27,
    height: 36,
    // shadowColor: $config.HARD_CODED_BLACK_COLOR + '10',
    // shadowOpacity: 0.1,
    // shadowOffset: {width: 0, height: 2},
    // shadowRadius: 2,
  },
  textContainer: {
    flex: 1,
    position: 'absolute',
    zIndex: 998,
    backgroundColor: $config.CARD_LAYER_3_COLOR,
    // borderWidth: 1,
    // borderColor: '#F2F2F2',
    // shadowColor: $config.HARD_CODED_BLACK_COLOR + '10',
    // shadowOpacity: 0.1,
    // shadowOffset: {width: 0, height: 4},
    // shadowRadius: 4,
    borderRadius: 12,
    top: -87,
  },
  textStyle: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: 24,
    textAlign: 'center',
    color: $config.FONT_COLOR,
    padding: 24,
  },
});

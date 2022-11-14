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
import {Icons, ImageIcon} from '../../agora-rn-uikit';

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
          background: toolTipVisible ? 'rgba(85, 85, 85, 0.1)' : 'transparent',
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
                style={styles.downsideTriangleIcon}
                name={'downsideTriangle'}
              />
            </View>
          </>
        ) : (
          <></>
        )}
        <ImageIcon style={styles.iconStyle} name={'info'} />
      </div>
    </>
  );
};

export default InfoBubble;

const styles = StyleSheet.create({
  iconStyle: {
    width: 20,
    height: 20,
    marginTop: 4,
    marginLeft: 4,
  },
  downsideTriangleIconContainer: {
    position: 'absolute',
    top: -40,
    left: -10,
    zIndex: 999,
  },
  downsideTriangleIcon: {
    width: 36,
    height: 36,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
  },
  textContainer: {
    flex: 1,
    position: 'absolute',
    zIndex: 998,
    backgroundColor: '#F2F2F2',
    borderWidth: 1,
    borderColor: '#F2F2F2',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 4,
    borderRadius: 12,
    top: -100,
  },
  textStyle: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    color: '#333333',
    padding: 24,
  },
});

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

interface InfoBubbleProps {
  text: string;
}

const InfoBubble = (props: InfoBubbleProps) => {
  const [toolTipVisible, setToolTipVisible] = useState(false);
  const [position, setPosition] = useState({});
  const [isPosCalculated, setIsPosCalculated] = useState(false);
  const pressableRef = useRef(null);
  const textViewRef = useRef(null);

  const setModalPosition = (width: number) => {
    setTimeout(() => {
      pressableRef?.current?.measure(
        (
          _fx: number,
          _fy: number,
          _localWidth: number,
          _localHeight: number,
          px: number,
          py: number,
        ) => {
          setPosition({
            top: py - 50,
            left: px - (width ? width / 2 : 0),
          });
          setIsPosCalculated(true);
        },
      );
    });
  };

  const showModal = () => {
    setToolTipVisible(!toolTipVisible);
    setIsPosCalculated(false);
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={toolTipVisible}
        onRequestClose={() => {
          setToolTipVisible(!toolTipVisible);
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            setToolTipVisible(!toolTipVisible);
          }}>
          <View style={styles.backDrop} />
        </TouchableWithoutFeedback>
        <View
          style={[
            styles.textContainer,
            position,
            {opacity: isPosCalculated ? 1 : 0},
          ]}
          onLayout={({
            nativeEvent: {
              layout: {x, y, width, height},
            },
          }) => {
            setModalPosition(width);
          }}
          ref={textViewRef}>
          <Text style={styles.textStyle}>{props.text}</Text>
        </View>
      </Modal>
      <Pressable
        style={styles.container}
        ref={pressableRef}
        onPress={() => {
          showModal();
        }}>
        <ImageIcon name="info" iconSize="small" />
      </Pressable>
    </>
  );
};

export default InfoBubble;

const styles = StyleSheet.create({
  infoText: {
    fontSize: 12,
    position: 'absolute',
    top: -45,
    left: -20,
    borderWidth: 1,
    padding: 5,
    backgroundColor: '#ffffff',
    borderColor: '#f2f2f2',
    borderRadius: 12,
    minWidth: 100,
  },
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  backDrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  textContainer: {
    position: 'absolute',
    zIndex: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F2F2F2',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 4,
    borderRadius: 12,
  },
  textStyle: {
    fontFamily: 'Source Sans Pro',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    color: '#333333',
    padding: 12,
  },
});

import {
  StyleSheet,
  View,
  ScrollView,
  Button,
  FlatList,
  Dimensions,
} from 'react-native';
import React from 'react';
import CommonStyles from '../../components/CommonStyles';
import {getGridLayoutName} from '../../pages/video-call/DefaultLayouts';
import {useLayout} from '../../utils/useLayout';
import {isMobileUA, isWebInternal, useIsSmall} from '../../utils/common';
import {TranscriptHeader} from '../../pages/video-call/SidePanelHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCaption} from './useCaption';
import {TranscriptText} from './TranscriptText';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';

export type Transcript = {
  [key: string]: string;
};

interface TranscriptProps {
  showHeader?: boolean;
}
const Transcript = (props: TranscriptProps) => {
  const isSmall = useIsSmall();
  const {currentLayout} = useLayout();
  const {showHeader = true} = props;
  const {transcript, meetingTranscript} = useCaption();
  const data = Object.entries(transcript);

  const [showButton, setShowButton] = React.useState(false);
  const [flatListHeight, setFlatListHeight] = React.useState(0);
  const flatListRef = React.useRef(null);

  const [listDimensions, setListDimensions] = React.useState({
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    console.log('new item pushed', meetingTranscript);
  }, [meetingTranscript]);

  const handleLayout = (event) => {
    setFlatListHeight(event.nativeEvent.layout.height);
  };

  const renderItem = ({item}) => (
    <TranscriptText user={item[0]} value={item[1]} />
  );

  const handleViewLatest = () => {
    setShowButton(false);
    //flatListRef.current.scrollToEnd({animated: true});
    flatListRef.current.scrollToOffset({
      offset: listDimensions.height,
      animated: true,
    });
  };

  // const handleContentSizeChange = () => {
  //   const isScrollable =
  //     flatListRef.current &&
  //     flatListRef.current.contentSize.height >
  //       flatListRef.current.layoutMeasurement.height;
  //   setShowButton(isScrollable);
  // };
  const handleContentSizeChange = (contentWidth, contentHeight) => {
    if (flatListHeight === 0) {
      setShowButton(false);
    } else {
      setShowButton(contentHeight > flatListHeight);
    }
    setListDimensions({width: contentWidth, height: contentHeight});
  };

  const handleScroll = (event) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const isAtTop = contentOffset.y <= 0;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height;

    setShowButton(!isAtBottom || isAtTop);
  };

  return (
    <View
      onLayout={handleLayout}
      style={[
        isMobileUA()
          ? //mobile and mobile web
            CommonStyles.sidePanelContainerNative
          : isSmall()
          ? // desktop minimized
            CommonStyles.sidePanelContainerWebMinimzed
          : // desktop maximized
            CommonStyles.sidePanelContainerWeb,
        isWebInternal() && !isSmall() && currentLayout === getGridLayoutName()
          ? {marginVertical: 4}
          : {},
      ]}>
      {showHeader && <TranscriptHeader />}
      {/* <ScrollView
        style={styles.contentContainer}
        onScroll={handleScroll}
        ref={containerRef}>
        {Object.entries(transcript).map(([key, value]) => (
          <TranscriptText user={key} value={value} />
        ))}
        {true && (
          <View style={{position: 'absolute', bottom: 20, right: 20}}>
            <Button title="View Latest" onPress={handleViewLatest} />
          </View>
        )}
      </ScrollView> */}

      <FlatList
        ref={flatListRef}
        style={styles.contentContainer}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}`}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        onLayout={(event) => {
          const {width, height} = event.nativeEvent.layout;
          setListDimensions({width, height});
        }}
      />
      {showButton && (
        <View
          style={{
            position: 'absolute',
            bottom: 30,
            left: 0,
            right: 0,
            alignItems: 'center',
            zIndex: 9999,
          }}>
          <PrimaryButton
            iconName={'down-arrow'}
            containerStyle={styles.showLatestBtn}
            textStyle={styles.textStyleBtn}
            onPress={handleViewLatest}
            iconSize={20}
            text={'View Latest'}
          />
        </View>
      )}
    </View>
  );
};

export default Transcript;

export const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'red',
  },
  container: {
    alignItems: 'flex-start',
  },
  showLatestBtn: {
    backgroundColor: $config.CARD_LAYER_5_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 'auto',
    borderRadius: 28,
  },
  textStyleBtn: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 19,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

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
  const contentHeightRef = React.useRef(0);
  const flatListHeightRef = React.useRef(0);
  const flatListRef = React.useRef(null);

  React.useEffect(() => {
    console.log('new item pushed', meetingTranscript);
  }, [meetingTranscript]);

  const handleLayout = (event) => {
    flatListHeightRef.current = event.nativeEvent.layout.height;
    if (contentHeightRef.current > event.nativeEvent.layout.height) {
      setShowButton(true);
    }
  };

  const renderItem = ({item}) => (
    <TranscriptText user={item[0]} value={item[1]} />
  );

  const handleViewLatest = () => {
    setShowButton(false);
    flatListRef.current.scrollToOffset({
      offset: contentHeightRef.current,
      animated: true,
    });
  };

  const handleContentSizeChange = (contentWidth, contentHeight) => {
    contentHeightRef.current = contentHeight;
    if (flatListHeightRef.current) {
      setShowButton(contentHeight > flatListHeightRef.current);
    }
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
      // onLayout={handleLayout}
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

      <FlatList
        ref={flatListRef}
        style={styles.contentContainer}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${index}`}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        onLayout={handleLayout}
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
    fontWeight: '400',
    textTransform: 'capitalize',
  },
});

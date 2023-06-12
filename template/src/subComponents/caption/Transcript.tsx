import {
  StyleSheet,
  View,
  ScrollView,
  Button,
  FlatList,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import React from 'react';
import CommonStyles from '../../components/CommonStyles';
import {getGridLayoutName} from '../../pages/video-call/DefaultLayouts';
import {useLayout} from '../../utils/useLayout';
import {isMobileUA, isWebInternal, useIsSmall} from '../../utils/common';
import {TranscriptHeader} from '../../pages/video-call/SidePanelHeader';
import {useRtc, useRender} from 'customization-api';
import {useCaption} from './useCaption';
import {TranscriptText} from './TranscriptText';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import Loading from '../Loading';
import ImageIcon from '../../atoms/ImageIcon';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import {streamMessageCallback} from './utils';

interface TranscriptProps {
  showHeader?: boolean;
}
const Transcript = (props: TranscriptProps) => {
  const isSmall = useIsSmall();
  const {currentLayout} = useLayout();
  const {showHeader = true} = props;
  const {
    setMeetingTranscript,
    meetingTranscript,
    isLangChangeInProgress,
    isSTTActive,
  } = useCaption();
  const data = meetingTranscript; // Object.entries(transcript);

  const [showButton, setShowButton] = React.useState(false);
  const contentHeightRef = React.useRef(0);
  const flatListHeightRef = React.useRef(0);
  const flatListRef = React.useRef(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const {RtcEngine} = useRtc();
  const {renderList} = useRender();

  const [textObj, setTextObj] = React.useState<{[key: string]: string}>({}); // state for current live caption for all users
  const finalList = React.useRef<{[key: number]: string[]}>({}); // holds transcript of final words of all users

  const startTimeRef = React.useRef<number>(0);
  const meetingTextRef = React.useRef<string>(''); // This is the full meeting text concatenated together.

  const renderListRef = React.useRef({renderList});

  const handleLayout = (event) => {
    flatListHeightRef.current = event.nativeEvent.layout.height;
    if (contentHeightRef.current > event.nativeEvent.layout.height) {
      setShowButton(true);
    }
  };

  const renderItem = ({item}) => {
    // Highlight the keyword in the text value
    const highlightedText = searchQuery
      ? item.text.replace(new RegExp(`(${searchQuery})`, 'gi'), '<b>$1</b>')
      : item.text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = item.text.split(regex);

    return (
      <TranscriptText
        user={item.name}
        time={item.time}
        value={item.text}
        searchQuery={searchQuery}
      />
    );
  };

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

  const handleSearch = (text) => {
    setSearchQuery(text);
    // Filter the data based on the search query
    const filteredResults = meetingTranscript.filter((item) =>
      item.text.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setSearchResults(filteredResults);
    // Scroll to the top of the FlatList when searching
    flatListRef.current.scrollToOffset({offset: 0, animated: true});
  };

  const renderedData = searchQuery ? searchResults : data;

  const NoResultsMsg = () => {
    return <Text style={styles.emptyMsg}>No search results found</Text>;
  };

  const meetingTranscriptRef = React.useRef(meetingTranscript);

  const sttObj = {
    renderListRef,
    finalList,
    meetingTextRef,
    startTimeRef,
    meetingTranscriptRef,
    setMeetingTranscript,
    setTextObj,
  };

  const handleStreamMessageCallback = (...args) => {
    streamMessageCallback(args, sttObj);
  };

  React.useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  React.useEffect(() => {
    !isSTTActive &&
      RtcEngine.addListener('StreamMessage', handleStreamMessageCallback);
  }, []);

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
      <View style={styles.searchContainer}>
        <ImageIcon
          name="search"
          iconSize={20}
          iconType="plain"
          tintColor={$config.SEMANTIC_NEUTRAL}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={
            $config.FONT_COLOR + ThemeConfig.EmphasisPlus.disabled
          }
        />
        <TouchableOpacity
          onPress={() => {
            setSearchQuery('');
          }}>
          <ImageIcon
            name="close"
            iconSize={20}
            iconType="plain"
            tintColor={$config.SEMANTIC_NEUTRAL}
          />
        </TouchableOpacity>
      </View>
      {isLangChangeInProgress ? (
        <Loading text="Setting Transcript Language..." />
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            style={styles.contentContainer}
            data={renderedData}
            renderItem={renderItem}
            keyExtractor={(item) => item.uid + '-' + item.time}
            onContentSizeChange={handleContentSizeChange}
            onScroll={handleScroll}
            onLayout={handleLayout}
            ListEmptyComponent={searchQuery && <NoResultsMsg />}
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
        </>
      )}
    </View>
  );
};

export default Transcript;

export const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
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
  /* search results*/
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    backgroundColor: $config.ICON_BG_COLOR,
    margin: 8,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_4_COLOR,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
    color: $config.FONT_COLOR,

    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.medium,
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 18,
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  searchButton: {
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  searchButtonText: {
    color: $config.FONT_COLOR,
    fontSize: 14,
  },
  emptyMsg: {
    color: $config.FONT_COLOR + hexadecimalTransparency['40%'],
    alignSelf: 'center',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

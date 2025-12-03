import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  VirtualizedList,
} from 'react-native';
import React from 'react';
import CommonStyles from '../../components/CommonStyles';
import {getGridLayoutName} from '../../pages/video-call/DefaultLayouts';
import {useLayout} from '../../utils/useLayout';
import {
  calculatePosition,
  debounceFn,
  isMobileUA,
  isWebInternal,
  useIsSmall,
} from '../../utils/common';
import {TranscriptHeader} from '../../pages/video-call/SidePanelHeader';
import {useRtc, useContent} from 'customization-api';
import {TranscriptItem, useCaption} from './useCaption';
import {TranscriptText} from './TranscriptText';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import Loading from '../Loading';
import ImageIcon from '../../atoms/ImageIcon';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import Spacer from '../../atoms/Spacer';
import useStreamMessageUtils from './useStreamMessageUtils';
import useCaptionWidth from './useCaptionWidth';
import DownloadTranscriptBtn from './DownloadTranscriptBtn';
import {useString} from '../../../src/utils/useString';
import {
  sttSettingSpokenLanguageText,
  sttSettingTranslationLanguageText,
  sttTranscriptPanelNoSearchResultsFoundText,
  sttTranscriptPanelSearchText,
  sttTranscriptPanelViewLatestText,
} from '../../../src/language/default-labels/videoCallScreenLabels';

export interface TranscriptProps {
  showHeader?: boolean;
}

type WebStreamMessageArgs = [number, Uint8Array];
type NativeStreamMessageArgs = [{}, number, number, Uint8Array, number, number];
type StreamMessageArgs = WebStreamMessageArgs | NativeStreamMessageArgs;

const Transcript = (props: TranscriptProps) => {
  const isSmall = useIsSmall();
  const {currentLayout} = useLayout();
  const {showHeader = true} = props;
  const {
    meetingTranscript,
    isLangChangeInProgress,
    isSTTListenerAdded,
    setIsSTTListenerAdded,
    getBotOwnerUid,
    isSTTActive,
    selectedTranslationLanguage,
    transcriptViewMode,
  } = useCaption();

  const settingSpokenLanguageLabel = useString(sttSettingSpokenLanguageText)();
  const settingTranslationLanguageLabel = useString<boolean>(
    sttSettingTranslationLanguageText,
  )(isSTTActive);
  const searchText = useString(sttTranscriptPanelSearchText)();
  const noresults = useString(sttTranscriptPanelNoSearchResultsFoundText)();
  const viewlatest = useString(sttTranscriptPanelViewLatestText)();

  const data = meetingTranscript; // Object.entries(transcript);
  console.log('[STT_GLOBAL] meetingTranscript data: ', data);

  const [showButton, setShowButton] = React.useState(false);

  const contentHeightRef = React.useRef(0);
  const flatListRef = React.useRef(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const {RtcEngineUnsafe} = useRtc();
  const {defaultContent} = useContent();
  const {streamMessageCallback} = useStreamMessageUtils();

  const [isFocused, setIsFocused] = React.useState(false);

  const {transcriptHeight} = useCaptionWidth();
  const isScrolledToEnd = React.useRef(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleLayout = () => {
    if (flatListRef.current && !isWebInternal()) {
      flatListRef.current.scrollToOffset({
        offset: contentHeightRef.current,
        animated: false,
      });

      isScrolledToEnd.current = true;
    }
  };

  const renderItem = ({item}: {item: TranscriptItem}) => {
    const speakerName =
      defaultContent[getBotOwnerUid(item.uid)]?.name || 'Speaker';
    const mode = transcriptViewMode;
    // Find translation (always return TranslationItem | null)
    const translation =
      item.selectedTranslationLanguage &&
      item.translations?.find(
        tr => tr.lang === item.selectedTranslationLanguage,
      )
        ? item.translations.find(
            tr => tr.lang === item.selectedTranslationLanguage,
          )
        : null;

    // system messages - spoken lang update
    if (item.uid.toString().indexOf('langUpdate') !== -1) {
      return (
        <View style={styles.langChangeContainer}>
          <ImageIcon
            iconType="plain"
            iconSize={20}
            tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
            name={'globe'}
          />

          <Text style={styles.langChange}>
            {/* {defaultContent[item?.uid?.split('-')[1]]?.name + ' ' + item.text} */}
            {item.text}
          </Text>
        </View>
      );
    }
    // system messages - target update
    if (item.uid.toString().indexOf('translationUpdate') !== -1) {
      return (
        <View style={styles.langChangeContainer}>
          <ImageIcon
            iconType="plain"
            iconSize={20}
            tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
            name={'lang-select'}
          />

          <Text style={styles.langChange}>
            {/* {defaultContent[item?.uid?.split('-')[1]]?.name +
              ' has ' +
              item.text} */}
            {item.text}
          </Text>
        </View>
      );
    }
    // Translated mode (default)
    if (mode === 'translated' && selectedTranslationLanguage) {
      if (!translation) {
        return null;
      } // hide if translation not available
      return (
        <TranscriptText
          user={speakerName}
          time={item.time}
          value={translation.text}
          translations={[]}
          searchQuery={searchQuery}
          selectedTranslationLanguage={selectedTranslationLanguage}
        />
      );
    }
    // original and translated
    return (
      <TranscriptText
        user={speakerName}
        time={item?.time}
        value={item.text}
        translations={translation ? [translation] : []}
        searchQuery={searchQuery}
        selectedTranslationLanguage={selectedTranslationLanguage}
      />
    );
  };

  const handleViewLatest = () => {
    // flatListRef.current.scrollToOffset({
    //   offset: contentHeightRef.current,
    //   animated: false,
    // });
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: false});
      setShowButton(false);
      isScrolledToEnd.current = true;
    }
  };

  const handleContentSizeChange = (contentWidth, contentHeight) => {
    contentHeightRef.current = contentHeight;
    if (!showButton && searchQuery.length === 0) {
      flatListRef.current.scrollToOffset({
        offset: contentHeightRef.current,
        animated: false,
      });

      isScrolledToEnd.current = true;
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrolledToEnd.current) {
      isScrolledToEnd.current = false;
      return;
    }

    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 1; // -1 threshold when the exact bottom position not calcualted , diff ~.5
    setShowButton(!isAtBottom);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Filter the data based on the search query
    const filteredResults = meetingTranscript.filter(item => {
      const searchText = text.toLowerCase();
      // Search in original text
      if (item.text.toLowerCase().includes(searchText)) {
        return true;
      }
      // Search in translations if available
      if (item.translations) {
        return item.translations.some(translation =>
          translation.text.toLowerCase().includes(searchText),
        );
      }
      return false;
    });
    setShowButton(false);
    setSearchResults(filteredResults);
    // Scroll to the top of the FlatList when searching
    flatListRef.current.scrollToOffset({offset: 0, animated: false});
  };

  const renderedData = searchQuery ? searchResults : data;

  const NoResultsMsg = () => {
    return <Text style={styles.emptyMsg}>{noresults}</Text>;
  };

  const handleStreamMessageCallback = (...args: StreamMessageArgs) => {
    console.log('[STT_GLOBAL] handleStreamMessageCallback', args);
    setIsSTTListenerAdded(true);
    if (isWebInternal()) {
      const [uid, data] = args as WebStreamMessageArgs;
      streamMessageCallback([uid, data]);
    } else {
      const [, uid, , data] = args as NativeStreamMessageArgs;
      streamMessageCallback([uid, data]);
    }
  };

  React.useEffect(() => {
    if (!isSTTListenerAdded) {
      RtcEngineUnsafe.addListener(
        'onStreamMessage',
        handleStreamMessageCallback,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        //@ts-ignore
        transcriptHeight && !isMobileUA() && {height: transcriptHeight},
        {paddingBottom: 20},
      ]}>
      {showHeader && <TranscriptHeader />}
      <View style={[styles.searchContainer, isFocused && styles.inputFocused]}>
        {!searchQuery && (
          <>
            <ImageIcon
              name="search"
              iconSize={20}
              iconType="plain"
              tintColor={$config.FONT_COLOR + hexadecimalTransparency['30%']}
            />
            <Spacer size={4} horizontal />
          </>
        )}
        <TextInput
          style={styles.searchInput}
          placeholder={searchText}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={
            $config.FONT_COLOR + hexadecimalTransparency['30%']
          }
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
            }}>
            <ImageIcon
              name="close"
              iconSize={20}
              iconType="plain"
              tintColor={$config.FONT_COLOR + hexadecimalTransparency['30%']}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {isLangChangeInProgress ? (
        <View style={{flex: 1}}>
          <Loading
            text={settingTranslationLanguageLabel}
            background="transparent"
            indicatorColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
            textColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
          />
        </View>
      ) : (
        <>
          <View style={{flex: 1}}>
            {/* <FlatList
              ref={flatListRef}
              style={styles.contentContainer}
              data={renderedData}
              renderItem={renderItem}
              keyExtractor={item => item.uid + '-' + item.time}
              onContentSizeChange={handleContentSizeChange}
              onScroll={handleScroll}
              onLayout={handleLayout}
              ListEmptyComponent={searchQuery && <NoResultsMsg />}
              ListFooterComponent={DownloadTranscriptBtn}
              ListFooterComponentStyle={styles.footer}
              contentContainerStyle={styles.content}
            /> */}
            <VirtualizedList
              ref={flatListRef}
              style={styles.contentContainer}
              data={renderedData}
              renderItem={renderItem}
              keyExtractor={item => item.uid + '-' + item?.time}
              onContentSizeChange={handleContentSizeChange}
              onScroll={
                isWebInternal()
                  ? debounceFn(handleScroll, isMobileUA() ? 500 : 300)
                  : handleScroll
              }
              onLayout={handleLayout}
              ListEmptyComponent={searchQuery && <NoResultsMsg />}
              ListFooterComponent={DownloadTranscriptBtn}
              ListFooterComponentStyle={styles.footer}
              contentContainerStyle={styles.content}
              getItemCount={() => renderedData.length}
              getItem={(data, index) => renderedData[index]}
            />

            {showButton ? (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                  zIndex: 9999,
                }}>
                <PrimaryButton
                  iconName={'view-last'}
                  containerStyle={styles.showLatestBtn}
                  textStyle={styles.textStyleBtn}
                  onPress={handleViewLatest}
                  iconSize={20}
                  text={viewlatest}
                />
              </View>
            ) : null}
          </View>
        </>
      )}
    </View>
  );
};

export default Transcript;

export const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
  },
  container: {
    alignItems: 'flex-start',
  },
  btnContainerStyle: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderRadius: 4,
  },
  btnContainer: {
    // margin: 20,
  },

  btnTxtStyle: {
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: ThemeConfig.FontSize.small,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  showLatestBtn: {
    backgroundColor: $config.CARD_LAYER_5_COLOR,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 16,
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
    padding: 10,

    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 4,
    height: 40,
    borderWidth: 1,

    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: ThemeConfig.FontSize.medium,
    width: '100%',
    borderWidth: 0,

    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  inputFocused: {
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
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
  langChange: {
    marginLeft: 4,
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  langChangeContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    borderWidth: 1,
    paddingVertical: 8,
    borderColor: $config.SECONDARY_ACTION_COLOR,
    borderRadius: 4,
    marginTop: 'auto',
  },
  content: {
    flexGrow: 1,
  },
});

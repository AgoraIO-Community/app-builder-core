import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
  VirtualizedList,
} from 'react-native';
import React from 'react';
import CommonStyles from '../../../components/CommonStyles';
import {getGridLayoutName} from '../../../pages/video-call/DefaultLayouts';
import {useLayout} from '../../../utils/useLayout';
import {
  calculatePosition,
  debounceFn,
  isMobileUA,
  isWebInternal,
  useIsSmall,
} from '../../../utils/common';
import {TranscriptHeader} from '../../../pages/video-call/SidePanelHeader';
import {useRtc, useContent} from 'customization-api';
import {useSonioxCaption} from './useSonioxCaption';
import {TranscriptText} from '../TranscriptText';
import ThemeConfig from '../../../theme';
import Loading from '../../Loading';
import ImageIcon from '../../../atoms/ImageIcon';
import hexadecimalTransparency from '../../../../src/utils/hexadecimalTransparency';
import useStreamMessageUtils from '../useStreamMessageUtils';
import useCaptionWidth from '../useCaptionWidth';
import DownloadTranscriptBtn from '../DownloadTranscriptBtn';
import {useString} from '../../../../src/utils/useString';
import {
  sttSettingSpokenLanguageText,
  sttTranscriptPanelNoSearchResultsFoundText,
  sttTranscriptPanelSearchText,
  sttTranscriptPanelViewLatestText,
} from '../../../../src/language/default-labels/videoCallScreenLabels';

export interface SonioxTranscriptProps {
  showHeader?: boolean;
}

type WebStreamMessageArgs = [number, Uint8Array];
type NativeStreamMessageArgs = [{}, number, number, Uint8Array, number, number];
type StreamMessageArgs = WebStreamMessageArgs | NativeStreamMessageArgs;

export const SonioxTranscript: React.FC<SonioxTranscriptProps> = ({
  showHeader = true,
}) => {
  const {
    meetingTranscript,
    isLangChangeInProgress,
    isSTTListenerAdded,
    setIsSTTListenerAdded,
    selectedTranslationLanguage,
  } = useSonioxCaption();
  const {RtcEngineUnsafe} = useRtc();
  const {defaultContent} = useContent();
  const {streamMessageCallback} = useStreamMessageUtils();
  const isSmall = useIsSmall();
  const {currentLayout} = useLayout();
  const {transcriptHeight} = useCaptionWidth();
  const ssLabel = useString(sttSettingSpokenLanguageText)();
  const viewLatestLabel = useString(sttTranscriptPanelViewLatestText)();
  const searchPlaceholder = useString(sttTranscriptPanelSearchText)();
  const noResultsLabel = useString(sttTranscriptPanelNoSearchResultsFoundText)();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [showBackToLatest, setShowBackToLatest] = React.useState(false);
  const flatListRef = React.useRef<VirtualizedList<any>>(null);

  const handleStreamMessageCallback = (...args: StreamMessageArgs) => {
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
    !isSTTListenerAdded &&
      RtcEngineUnsafe.addListener(
        'onStreamMessage',
        handleStreamMessageCallback,
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom when new messages arrive and user is not searching
  React.useEffect(() => {
    if (meetingTranscript.length > 0 && !searchQuery && flatListRef.current) {
      // Small delay to ensure the list has rendered the new item
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToEnd({animated: true});
        } catch (error) {
          console.log('Scroll to end error:', error);
        }
      }, 100);
    }
  }, [meetingTranscript.length, searchQuery]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const isAtBottom = 
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
    
    setShowBackToLatest(!isAtBottom && meetingTranscript.length > 0);
  };

  const scrollToLatest = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
      setShowBackToLatest(false);
    }
  };

  // Filter transcripts based on search query
  const filteredTranscript = React.useMemo(() => {
    if (!searchQuery) return meetingTranscript;
    
    return meetingTranscript.filter(item => {
      const textMatches = item.text.toLowerCase().includes(searchQuery.toLowerCase());
      const translationMatches = item.translations?.some(trans => 
        trans.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return textMatches || translationMatches;
    });
  }, [meetingTranscript, searchQuery]);

  const debouncedSearch = React.useCallback(
    debounceFn((query: string) => {
      setSearchQuery(query);
    }, 300),
    [],
  );

  const renderItem = ({item, index}: {item: any; index: number}) => {
    return item.uid.toString().indexOf('langUpdate') !== -1 ? (
      <View style={styles.langChangeContainer}>
        <ImageIcon
          iconType="plain"
          iconSize={20}
          tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
          name={'lang-select'}
        />
        <Text style={styles.langChange}>
          {defaultContent[item?.uid?.split('-')[1]]?.name + ' ' + item.text}
        </Text>
      </View>
    ) : item.uid.toString().indexOf('translationUpdate') !== -1 ? (
      <View style={styles.langChangeContainer}>
        <ImageIcon
          iconType="plain"
          iconSize={20}
          tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
          name={'lang-select'}
        />
        <Text style={styles.langChange}>
          {defaultContent[item?.uid?.split('-')[1]]?.name + ' has ' + item.text}
        </Text>
      </View>
    ) : (
      <TranscriptText
        key={`${item.uid}-${item.time}-${index}`}
        user={defaultContent[item.uid]?.name || 'Speaker'}
        value={item.text}
        translations={item.translations}
        time={item.time}
        searchQuery={searchQuery}
        selectedTranslationLanguage={selectedTranslationLanguage}
      />
    );
  };

  const getItem = (data: any[], index: number) => data[index];
  const getItemCount = (data: any[]) => data.length;

  if (isLangChangeInProgress) {
    return (
      <View style={styles.container}>
        {showHeader && <TranscriptHeader />}
        <View style={styles.loadingContainer}>
          <Loading
            text={ssLabel + ' (Soniox)'}
            background="transparent"
            indicatorColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
            textColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
          />
        </View>
      </View>
    );
  }

  return (
    <View
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
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={searchPlaceholder}
          placeholderTextColor={$config.FONT_COLOR + hexadecimalTransparency['50%']}
          value={searchQuery}
          onChangeText={debouncedSearch}
          returnKeyType="search"
        />
      </View>

      {/* Transcript List */}
      <View style={styles.transcriptContainer}>
        {filteredTranscript.length === 0 ? (
          <View style={styles.emptyContainer}>
            {searchQuery ? (
              <Text style={styles.emptyText}>{noResultsLabel}</Text>
            ) : (
              <Text style={styles.emptyText}>No Soniox transcripts yet...</Text>
            )}
          </View>
        ) : (
          <VirtualizedList
            ref={flatListRef}
            data={filteredTranscript}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.uid}-${item.time}-${index}`}
            getItem={getItem}
            getItemCount={getItemCount}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.transcriptList}
            contentContainerStyle={styles.transcriptContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={DownloadTranscriptBtn}
            ListFooterComponentStyle={styles.footer}
          />
        )}
      </View>

      {/* Back to Latest Button */}
      {showBackToLatest && (
        <TouchableOpacity style={styles.backToLatestButton} onPress={scrollToLatest}>
          <Text style={styles.backToLatestText}>{viewLatestLabel}</Text>
          <ImageIcon
            name="arrow-down"
            tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
            iconSize={16}
          />
        </TouchableOpacity>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: $config.CARD_LAYER_2_COLOR,
  },
  searchInput: {
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: $config.FONT_COLOR,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
  },
  transcriptContainer: {
    flex: 1,
  },
  transcriptList: {
    flex: 1,
  },
  transcriptContent: {
    padding: 12,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: $config.FONT_COLOR + hexadecimalTransparency['50%'],
    fontSize: 14,
    textAlign: 'center',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  backToLatestButton: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    elevation: 3,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backToLatestText: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
  },
  downloadContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: $config.CARD_LAYER_2_COLOR,
  },
  footer: {
    borderWidth: 1,
    paddingVertical: 8,
    borderColor: $config.SECONDARY_ACTION_COLOR,
    borderRadius: 4,
    marginTop: 'auto',
  },
  langChangeContainer: {
    marginBottom: 20,
    flexDirection: 'row',
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
});

export default SonioxTranscript;
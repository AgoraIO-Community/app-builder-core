import {StyleSheet, View, ScrollView} from 'react-native';
import React from 'react';
import CommonStyles from '../../components/CommonStyles';
import {getGridLayoutName} from '../../pages/video-call/DefaultLayouts';
import {useLayout} from '../../utils/useLayout';
import {
  isMobileUA,
  isWebInternal,
  maxInputLimit,
  useIsSmall,
} from '../../utils/common';
import {TranscriptHeader} from '../../pages/video-call/SidePanelHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useCaption} from './useCaption';
import ThemeConfig from '../../../src/theme';
import {TranscriptText} from './TranscriptText';

type Transcript = {
  [key: string]: string;
};

interface TranscriptProps {
  showHeader?: boolean;
}
const Transcript = (props: TranscriptProps) => {
  const isSmall = useIsSmall();
  const {currentLayout} = useLayout();
  const {showHeader = true} = props;
  const {transcript} = useCaption();

  const [fullTranscript, setFullTranscript] = React.useState<Transcript>({});

  React.useEffect(() => {
    const loadTranscript = async () => {
      try {
        const fullTranscript = await AsyncStorage.getItem('fullTranscript');
        if (fullTranscript !== null) {
          setFullTranscript(JSON.parse(fullTranscript));
        }
      } catch (error) {
        console.log(error);
      }
    };
    loadTranscript();
  }, []);

  React.useEffect(() => {
    const updateTranscript = async () => {
      const newTranscript = {...fullTranscript, ...transcript};
      setFullTranscript(newTranscript);
    };
    updateTranscript();
  }, [transcript]);

  // React.useEffect(() => {
  //   const handleStorage = (e: StorageEvent) => {
  //     if (e.key === 'fullTranscript') {
  //       setTranscript(JSON.parse(e.newValue as string));
  //     }
  //   };
  //   window.addEventListener('storage', handleStorage);
  //   return () => window.removeEventListener('storage', handleStorage);
  // }, []);

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
      ]}>
      {showHeader && <TranscriptHeader />}
      <ScrollView style={styles.contentContainer}>
        {Object.entries(fullTranscript).map(([key, value]) => (
          <TranscriptText user={key} value={value} />
        ))}
      </ScrollView>
    </View>
  );
};

export default Transcript;

export const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
  },
});

import React from 'react';
import {formatTranscriptContent} from './utils';
import {useCaption} from './useCaption';
import RNFetchBlob from 'rn-fetch-blob';
import {isAndroid, isIOS, useRoomInfo, useContent} from 'customization-api';
import Share from 'react-native-share';
import {LogSource, logger} from '../../logger/AppBuilderLogger';

const useTranscriptDownload = (): {
  downloadTranscript: () => Promise<string | null>;
  isTranscriptPreparing: boolean;
} => {
  const {flushPendingTranscript, getMeetingTranscript} = useCaption();
  const [isTranscriptPreparing, setIsTranscriptPreparing] =
    React.useState(false);
  const {defaultContent} = useContent();
  const {
    data: {meetingTitle},
  } = useRoomInfo();

  const downloadTranscript = async (): Promise<string | null> => {
    if (isTranscriptPreparing) {
      return null;
    }

    setIsTranscriptPreparing(true);
    try {
      logger.log(
        LogSource.Internals,
        'TRANSCRIPT',
        'Trying to download transcript',
      );
      await flushPendingTranscript();
      const transcriptSnapshot = getMeetingTranscript();
      const [finalContent, fileName] = formatTranscriptContent(
        transcriptSnapshot,
        meetingTitle,
        defaultContent,
      );

      // get path to the Documents directory, don't have access to Downloads folder so saving in documents 1
      const documentsDir = RNFetchBlob.fs.dirs.DocumentDir;

      // setting file path
      const filePath = `${documentsDir}/${fileName}`;

      // Writing content to the file
      await RNFetchBlob.fs.writeFile(filePath, finalContent, 'utf8');
      logger.warn(
        LogSource.Internals,
        'TRANSCRIPT',
        'Content downloaded successfully on native',
      );

      // need to show the preview of downloaded file
      const result = await Share.open({
        url: `file://${filePath}`,
        type: 'text/plain',
      });
      logger.warn(
        LogSource.Internals,
        'TRANSCRIPT',
        'File shared successfully:',
        result,
      );
      return filePath;
    } catch (error) {
      logger.error(
        LogSource.Internals,
        'TRANSCRIPT',
        'Error downloading content:',
        error,
      );
      throw error;
    } finally {
      setIsTranscriptPreparing(false);
    }
  };

  return {downloadTranscript, isTranscriptPreparing};
};

export default useTranscriptDownload;

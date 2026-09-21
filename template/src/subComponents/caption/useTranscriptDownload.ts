import React from 'react';
import {formatTranscriptContent} from './utils';
import {useCaption} from './useCaption';
import {useRoomInfo, useContent} from 'customization-api';
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
      await flushPendingTranscript();
      const transcriptSnapshot = getMeetingTranscript();
      const [finalContent, fileName] = formatTranscriptContent(
        transcriptSnapshot,
        meetingTitle,
        defaultContent,
      );

      // blob with required content
      const blob = new Blob([finalContent], {type: 'text/plain'});

      // url to download content
      const downloadUrl = URL.createObjectURL(blob);

      // anchor ele to download
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = fileName;

      // click to dowload the file
      anchor.click();

      // revoke download url
      URL.revokeObjectURL(downloadUrl);
      logger.debug(
        LogSource.Internals,
        'TRANSCRIPT',
        'content downloaded successfully',
      );
      return downloadUrl;
    } catch (error) {
      logger.error(
        LogSource.Internals,
        'TRANSCRIPT',
        'failed to download content',
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

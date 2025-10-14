import {formatTranscriptContent} from './utils';
import {useCaption} from './useCaption';
import {useRoomInfo, useContent} from 'customization-api';
import {LogSource, logger} from '../../logger/AppBuilderLogger';

const useTranscriptDownload = (): {
  downloadTranscript: () => Promise<string | null>;
} => {
  const {meetingTranscript} = useCaption();

  const {defaultContent} = useContent();
  const {
    data: {meetingTitle},
  } = useRoomInfo();

  const downloadTranscript = (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      try {
        const [finalContent, fileName] = formatTranscriptContent(
          meetingTranscript,
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
          'content donwloaded successfully',
        );
        resolve(downloadUrl);
      } catch (error) {
        logger.error(
          LogSource.Internals,
          'TRANSCRIPT',
          'failed to download content',
          error,
        );
        reject(error);
      }
    });
  };

  return {downloadTranscript};
};

export default useTranscriptDownload;

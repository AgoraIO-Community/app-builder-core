import {formatTranscriptContent} from './utils';
import {useCaption} from './useCaption';
import {useMeetingInfo, useRender} from 'customization-api';

const useTranscriptDownload = (): {
  downloadTranscript: () => Promise<string | null>;
} => {
  const {meetingTranscript} = useCaption();

  const {renderList} = useRender();
  const {
    data: {meetingTitle},
  } = useMeetingInfo();

  const downloadTranscript = (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      try {
        const [finalContent, fileName] = formatTranscriptContent(
          meetingTranscript,
          meetingTitle,
          renderList,
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
        console.log('Content downloaded successfully.');
        resolve(downloadUrl);
      } catch (error) {
        console.error('Error downloading content:', error);
        reject(error);
      }
    });
  };

  return {downloadTranscript};
};

export default useTranscriptDownload;

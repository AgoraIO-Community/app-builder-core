import {formatTime} from './utils';
import {useCaption} from './useCaption';

const useTranscriptDownload = (): {
  downloadTranscript: () => Promise<string | null>;
} => {
  const {meetingTranscript} = useCaption();

  const downloadTranscript = (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      try {
        const formattedContent = meetingTranscript
          .map(
            (item) =>
              `${item.name} ${formatTime(Number(item.time))}: ${item.text}`,
          )
          .join('\n\n');

        // blob with required content
        const blob = new Blob([formattedContent], {type: 'text/plain'});

        // url to download content
        const downloadUrl = URL.createObjectURL(blob);

        // to give unique file name
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 10);
        const formattedTime = currentDate
          .toTimeString()
          .slice(0, 8)
          .replace(/:/g, '');

        // adding the filename
        const fileName = `MeetingTranscript_${formattedDate}_${formattedTime}.txt`;
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
import {formatTime} from './utils';
import {useCaption} from './useCaption';
import RNFetchBlob from 'rn-fetch-blob';
import {isAndroid, isIOS} from 'customization-api';

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

        // get path to the Documents directory, don't have access to Downloads folder so saving in documents
        const documentsDir = RNFetchBlob.fs.dirs.DocumentDir;

        // current date and time for file name
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 10);
        const formattedTime = currentDate
          .toTimeString()
          .slice(0, 8)
          .replace(/:/g, '');

        const fileName = `MeetingTranscript_${formattedDate}_${formattedTime}.txt`;
        // setting file path
        const filePath = `${documentsDir}/${fileName}`;

        // Writing content to the file
        RNFetchBlob.fs
          .writeFile(filePath, formattedContent, 'utf8')
          .then(() => {
            console.warn('Content downloaded successfully on native.');
            // display preview of the document and option to share
            if (isIOS()) {
              RNFetchBlob.ios.previewDocument(filePath);
            } else if (isAndroid()) {
              console.warn('android download complete');
              // need to show the preview of downloaded file
            }
            resolve(filePath);
          })
          .catch((error) => {
            console.error('Error downloading content:', error);
            reject(error);
          });
      } catch (error) {
        console.error('Error downloading content:', error);
        reject(error);
      }
    });
  };

  return {downloadTranscript};
};

export default useTranscriptDownload;

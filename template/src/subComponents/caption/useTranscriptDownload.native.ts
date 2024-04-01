import {formatTranscriptContent} from './utils';
import {useCaption} from './useCaption';
import RNFetchBlob from 'rn-fetch-blob';
import {isAndroid, isIOS, useRoomInfo, useContent} from 'customization-api';
import Share from 'react-native-share';
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
        logger.log(
          LogSource.Internals,
          'TRANSCRIPT',
          'Trying to download transcript',
        );
        const [finalContent, fileName] = formatTranscriptContent(
          meetingTranscript,
          meetingTitle,
          defaultContent,
        );

        // get path to the Documents directory, don't have access to Downloads folder so saving in documents 1
        const documentsDir = RNFetchBlob.fs.dirs.DocumentDir;

        // setting file path
        const filePath = `${documentsDir}/${fileName}`;

        // Writing content to the file
        RNFetchBlob.fs
          .writeFile(filePath, finalContent, 'utf8')
          .then(() => {
            logger.warn(
              LogSource.Internals,
              'TRANSCRIPT',
              'Content downloaded successfully on native',
            );
            // need to show the preview of downloaded file
            Share.open({url: `file://${filePath}`, type: 'text/plain'})
              .then(res => {
                logger.warn(
                  LogSource.Internals,
                  'TRANSCRIPT',
                  'File shared successfully:',
                  res,
                );
                resolve(filePath);
              })
              .catch(error => {
                logger.error(
                  LogSource.Internals,
                  'TRANSCRIPT',
                  'Error sharing file:',
                  error,
                );
                reject(error);
              });

            resolve(filePath);
          })
          .catch(error => {
            logger.error(
              LogSource.Internals,
              'TRANSCRIPT',
              'Error downloading content:',
              error,
            );
            reject(error);
          });
      } catch (error) {
        logger.error(
          LogSource.Internals,
          'TRANSCRIPT',
          'Error downloading content:',
          error,
        );
        reject(error);
      }
    });
  };

  return {downloadTranscript};
};

export default useTranscriptDownload;

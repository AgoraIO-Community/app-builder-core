import {formatTime} from './utils';
import {useCaption} from './useCaption';
import RNFetchBlob from 'rn-fetch-blob';
import {isAndroid, isIOS, useMeetingInfo, useRender} from 'customization-api';
import Share from 'react-native-share';

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
        const formattedContent = meetingTranscript
          .map((item) => {
            if (item.uid.toString().indexOf('langUpdate') !== -1)
              return `${renderList[item?.uid?.split('-')[1]]?.name} ${
                item.text
              }`;
            return `${renderList[item.uid].name} ${formatTime(
              Number(item.time),
            )}:\n${item.text}`;
          })
          .join('\n\n');

        const startTime = new Date(meetingTranscript[0].time);
        const attendees = Object.entries(renderList)
          .filter((arr) => arr[1].type === 'rtc')
          .map((arr) => arr[1].name)
          .join(',');
        const finalContent = `${meetingTitle}-${startTime}-Transcript \n\nAttendees\n${attendees} \n\nTranscript \n${formattedContent}`;

        // get path to the Documents directory, don't have access to Downloads folder so saving in documents 1
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
          .writeFile(filePath, finalContent, 'utf8')
          .then(() => {
            console.warn('Content downloaded successfully on native.');
            // display preview of the document and option to share
            if (isIOS()) {
              RNFetchBlob.ios.previewDocument(filePath);
            } else if (isAndroid()) {
              console.warn('android download complete !');
              // need to show the preview of downloaded file
              Share.open({url: `file://${filePath}`, type: 'text/plain'})
                .then((res) => {
                  console.warn('File shared successfully:', res);
                  resolve(filePath);
                })
                .catch((error) => {
                  console.error('Error sharing file:', error);
                  reject(error);
                });
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

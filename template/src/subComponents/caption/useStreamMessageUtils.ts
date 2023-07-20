import React, {useState, useRef, useEffect} from 'react';
import {useCaption} from './useCaption';
import {formatTime} from './utils';
import protoRoot from './proto/ptoto';
import {useRender} from 'customization-api';

type StreamMessageCallback = (args: [number, Uint8Array]) => void;
type FinalListType = {
  [key: string]: string[];
};
type TranscriptItem = {
  name: string;
  uid: string;
  time: number;
  text: string;
};
const useStreamMessageUtils = (): {
  streamMessageCallback: StreamMessageCallback;
  downloadTranscript: () => void;
} => {
  const {meetingTranscript, setCaptionObj, setMeetingTranscript, captionObj} =
    useCaption();
  const startTimeRef = useRef<number>(0);
  const finalList = useRef<FinalListType>({});
  const {renderList} = useRender();
  const renderListRef = useRef({renderList});

  /* renderlist was not updating when new user joins the call */
  useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  //  handles the stream messages and updates the state variables.
  const streamMessageCallback: StreamMessageCallback = (args) => {
    /* uid - bot which sends stream message in channel
       payload - stream message in Uint8Array format
      */
    const [uid, payload] = args;
    let nonFinalList = []; // holds intermediate results
    let currentText = ''; // holds current caption
    let currentTranscript: TranscriptItem = {
      name: '',
      uid: '',
      time: 0,
      text: '',
    };

    const textstream = protoRoot
      .lookupType('Text')
      .decode(payload as Uint8Array) as any;
    console.log('STT - Parsed Textstream : ', textstream);

    // identifying speaker of caption
    const userName =
      renderListRef.current.renderList[textstream.uid]?.name || 'Speaker';
    /* creating [] for each user to store their complete transcripts
       ex: {282190954:[]}
    */
    if (!finalList.current[textstream.uid]) {
      finalList.current[textstream.uid] = [];
    }

    const words = textstream.words; //[Word,Word]

    /* categorize words into final & nonFinal objects per uid
      Final Word Ex : {
      "text": "Hello, are you doing?",
      "durationMs": 960,
      "isFinal": true,
      "confidence": 0.8549408316612244
      }
  */
    for (const word of words) {
      if (word.isFinal) {
        finalList.current[textstream.uid].push(word.text);
        currentText += word.text;
        // log info to show measure the duration of passes in which a sentence gets finalized
        const duration = performance.now() - startTimeRef.current;
        console.log(
          `stt-Time taken to finalize caption ${currentText}: ${duration}ms`,
        );
        startTimeRef.current = null; // Reset start time
      } else {
        word.text !== '.' && nonFinalList.push(word.text);
        if (!startTimeRef.current) {
          startTimeRef.current = performance.now();
        }
      }
    }

    /* after getting the final word in the streamMessage 
       checking if previous transcript be updated or new entry should be added   
     */
    if (currentText.length) {
      let shouldTranscriptBeUpdated = false;

      setMeetingTranscript((prevTranscript) => {
        // getting the last item in the transcript
        currentTranscript =
          prevTranscript.length > 0
            ? prevTranscript[prevTranscript.length - 1]
            : null;
        /* 
          checking if the last item transcript matches with current uid and there is delay of less than 3 sec.
          If yes then updating the last transcript msg with current text
          If no then adding a new entry in the transcript  
        */
        if (
          currentTranscript &&
          currentTranscript.uid === textstream.uid &&
          new Date().getTime() - currentTranscript.time < 30000
        ) {
          currentTranscript.text = currentTranscript.text + ' ' + currentText;
          shouldTranscriptBeUpdated = true;
        }

        if (shouldTranscriptBeUpdated && currentTranscript) {
          // updating existing
          prevTranscript[prevTranscript.length - 1] = currentTranscript;
          return prevTranscript;
        } else {
          // adding new entry
          return [
            ...prevTranscript,
            {
              name: userName,
              uid: textstream.uid,
              time: new Date().getTime(),
              text: currentText,
            },
          ];
        }
      });
    }

    /* 
     stringBuilder- used to create strings for live captioning
     Previous final words of the uid are prepended and 
     then current non final words so that context of speech is not lost
    */

    // If person is not speaking or mic is muted, then we don't want to show live captions
    // <CaptionContainer> after each interval of 3s , clearing live captions so removing from finalist as well
    // as from stt api we are not able to know if person has stopped speaking
    setCaptionObj((prevState) => {
      if (
        prevState &&
        prevState[textstream.uid] &&
        prevState[textstream.uid].text === ''
      ) {
        finalList.current[textstream.uid] = [];
      }
      let stringBuilder = finalList?.current[textstream.uid]?.join(' ');
      stringBuilder += stringBuilder?.length > 0 ? ' ' : '';
      stringBuilder += nonFinalList?.join(' ');
      if (stringBuilder === '') return {...prevState};
      return {
        ...prevState,
        [textstream.uid]: {
          text: stringBuilder,
          lastUpdated: new Date().getTime(),
        },
      };
    });

    console.group('STT-logs');
    console.log('stt-finalList =>', finalList.current);
    console.log('stt - current text =>', currentText);
    console.groupEnd();
  };

  // handles download of meeting Transcript
  // TODO: does not works on native : react0native-blob
  const downloadTranscript = () => {
    try {
      const formattedContent = meetingTranscript
        .map(
          (item) =>
            `${item.name} ${formatTime(Number(item.time))}: ${item.text}`,
        )
        .join('\n');

      // Create a Blob with the formatted content
      const blob = new Blob([formattedContent], {type: 'text/plain'});

      // Generate a download URL for the Blob
      const downloadUrl = URL.createObjectURL(blob);

      // Create an anchor element to initiate the download
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = 'MeetingTranscript.txt';

      // Programmatically click the anchor element to trigger the download
      anchor.click();

      // Cleanup: Revoke the download URL
      URL.revokeObjectURL(downloadUrl);

      console.log('Content downloaded successfully.');
    } catch (error) {
      console.error('Error downloading content:', error);
    }
  };

  return {
    streamMessageCallback,
    downloadTranscript,
  };
};

export default useStreamMessageUtils;

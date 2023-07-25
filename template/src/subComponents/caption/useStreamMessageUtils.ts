import React, {useRef, useEffect} from 'react';
import {useCaption} from './useCaption';
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
} => {
  const {setCaptionObj, setMeetingTranscript} = useCaption();
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

    // calculating for how long the words were spoken for a uid.
    const totalDurationMs = textstream.words?.reduce(
      (total, word) => total + word.durationMs,
      0,
    );

    // setting timer to clear after the caption when a user stops speaking
    if (totalDurationMs) {
      console.log(
        `stt: clearing captions in for ${userName} in ${totalDurationMs} ms with text : ${finalList?.current[
          textstream.uid
        ].join(',')}`,
      );
      setTimeout(() => {
        finalList.current[textstream.uid] = [];
        setCaptionObj((prev) => {
          return {
            ...prev,
            [textstream.uid]: {
              text: '',
              lastUpdated: new Date().getTime(),
            },
          };
        });
      }, totalDurationMs);
    }

    /* 
     stringBuilder- used to create strings for live captioning
     Previous final words of the uid are prepended and 
     then current non final words so that context of speech is not lost
    */
    let stringBuilder = finalList?.current[textstream.uid]?.join(' ');
    stringBuilder += stringBuilder?.length > 0 ? ' ' : '';
    stringBuilder += nonFinalList?.join(' ');

    // updating the captions when there is some text
    stringBuilder &&
      setCaptionObj((prevState) => {
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

  return {
    streamMessageCallback,
  };
};

export default useStreamMessageUtils;

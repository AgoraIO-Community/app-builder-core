import React, {useRef, useEffect} from 'react';
import {useCaption} from './useCaption';
import protoRoot from './proto/ptoto';
import {useRender} from 'customization-api';

type StreamMessageCallback = (args: [number, Uint8Array]) => void;
type FinalListType = {
  [key: string]: string[];
};
type TranscriptItem = {
  uid: string;
  time: number;
  text: string;
};

const waitTimeToClearCaptions = 10000;
const useStreamMessageUtils = (): {
  streamMessageCallback: StreamMessageCallback;
} => {
  const {
    setCaptionObj,
    setMeetingTranscript,
    captionObj,
    setActiveSpeakerUID,
    setPrevActiveSpeakerUID,
    activeSpeakerUID,
    prevActiveSpeakerUID,
  } = useCaption();
  const startTimeRef = useRef<number>(0);
  const finalList = useRef<FinalListType>({});

  const activeSpeakerRef = useRef(activeSpeakerUID);
  const prevSpeakerRef = useRef(prevActiveSpeakerUID);

  useEffect(() => {
    activeSpeakerRef.current = activeSpeakerUID;
  }, [activeSpeakerUID]);
  useEffect(() => {
    prevSpeakerRef.current = prevActiveSpeakerUID;
  }, [prevActiveSpeakerUID]);

  //  handles the stream messages and updates the state variables.
  const streamMessageCallback: StreamMessageCallback = (args) => {
    /* uid - bot which sends stream message in channel
       payload - stream message in Uint8Array format
      */
    const [uid, payload] = args;
    let nonFinalList = []; // holds intermediate results
    let currentText = ''; // holds current caption
    let currentTranscript: TranscriptItem = {
      uid: '',
      time: 0,
      text: '',
    };

    const textstream = protoRoot
      .lookupType('Text')
      .decode(payload as Uint8Array) as any;
    console.log('STT - Parsed Textstream : ', textstream);

    console.group('STT-logs');
    console.log('Recived uid =>', textstream.uid);
    console.log('PrevSpeaker uid =>', prevSpeakerRef.current);
    console.log('ActiveSpeaker uid=>', activeSpeakerRef.current);
    console.log('final List =>', finalList);
    console.groupEnd();

    //Updating Active speakers only if there is a change in active speaker

    if (textstream.uid !== activeSpeakerRef.current) {
      // we have a speaker change so clear the context for prev speaker
      if (prevSpeakerRef.current !== '') {
        finalList.current[prevSpeakerRef.current] = [];
      }

      //finalList.current[activeSpeakerRef.current] = [];
      setPrevActiveSpeakerUID(activeSpeakerRef.current);
      setActiveSpeakerUID(textstream.uid);
    }

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
          currentTranscript.uid === textstream.uid
          //  && new Date().getTime() - currentTranscript.time < 30000
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
    let stringBuilder =
      textstream.uid === prevSpeakerRef.current
        ? ''
        : finalList?.current[textstream.uid]?.join(' ');
    stringBuilder += stringBuilder?.length > 0 ? ' ' : '';
    stringBuilder += nonFinalList?.join(' ');

    // updating the captions when there is some text
    stringBuilder &&
      setCaptionObj((prevState) => {
        // also check for last updated for other speakers

        return {
          ...prevState,
          [textstream.uid]: {
            text: stringBuilder,
            lastUpdated: new Date().getTime(),
          },
          //  ...inActiveUserObj,
        };
      });
  };

  return {
    streamMessageCallback,
  };
};

export default useStreamMessageUtils;

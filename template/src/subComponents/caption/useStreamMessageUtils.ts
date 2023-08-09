import React, {useRef} from 'react';
import {useCaption} from './useCaption';
import protoRoot from './proto/ptoto';

type StreamMessageCallback = (args: [number, Uint8Array]) => void;
type FinalListType = {
  [key: string]: string[];
};
type TranscriptItem = {
  uid: string;
  time: number;
  text: string;
};

const useStreamMessageUtils = (): {
  streamMessageCallback: StreamMessageCallback;
} => {
  const {
    setCaptionObj,
    setMeetingTranscript,
    activeSpeakerRef,
    prevSpeakerRef,
  } = useCaption();
  const startTimeRef = useRef<number>(0);
  const finalList = useRef<FinalListType>({});

  const streamMessageCallback: StreamMessageCallback = (args) => {
    /* uid - bot which sends stream message in channel
       payload - stream message in Uint8Array format
      */
    const [uid, payload] = args;
    let nonFinalText = ''; // holds intermediate results
    let currentFinalText = ''; // holds current caption
    let isInterjecting = false;

    const textstream = protoRoot
      .lookupType('Text')
      .decode(payload as Uint8Array) as any;

    console.log('STT - Parsed Textstream : ', textstream);

    // Identifing Current & Prev Speakers for the Captions
    /*
      t0 A : Hi All!
      t1 B : Hi A
      t2 A : Hi B
      t3 C : What's Plan
      t4 B : Goal Planning
      t5 C : Yes Agree

     Screen:
     Time           :  t0       |   t1      |    t2     |      t3         |       t4          |    t5
     Prev Speaker   :           | A:Hi All! |  B: Hi A  |  A: Hi  B       |  C: What's Plan   |  B: Goal Planning
     Active Speaker : A:Hi All! | B: Hi A   |  A: Hi B  |  C: What's Plan |  B: Goal Planning |  C: Yes Agree
     Clearing Required:                           A               B                A                     C

     Logic:
     time           :  t0  t1 t2 t3 t4 t5       
     textstream.uid :   A  B  A  C  B  C
     (B)prevSpeaker :   -  -  A  B  A  C
     (B)activeSpeake:   -  A  B  A  C  B
     Prev Data clear:   -  -  A  B  A  C 
     ################## CHANGE ######################
     (A)prevSpeaker :   -  A  B  A  C  B
     (A)activeSpeake:   A  B  A  C  B  C 

     Clear when textStream.uid == prevSpeakerRef.current

    */

    if (textstream.uid !== activeSpeakerRef.current) {
      // we have a speaker change so clear the context for prev speaker
      if (prevSpeakerRef.current !== '') {
        finalList.current[prevSpeakerRef.current] = [];
        isInterjecting = true;
      }
      prevSpeakerRef.current = activeSpeakerRef.current;
      activeSpeakerRef.current = textstream.uid;
    }

    /* creating [] for each user to store their complete transcripts
       initializing captions state for cuurent speaker
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
        currentFinalText = word.text;
        // log info to show measure the duration of passes in which a sentence gets finalized
        const duration = performance.now() - startTimeRef.current;
        console.log(
          `stt-Time taken to finalize caption ${currentFinalText}: ${duration}ms`,
        );
        startTimeRef.current = null; // Reset start time
      } else {
        nonFinalText = word.text !== '.' ? word.text : nonFinalText;
        if (!startTimeRef.current) {
          startTimeRef.current = performance.now();
        }
      }
    }

    /* Updating Meeting Transcript */
    if (currentFinalText.length) {
      setMeetingTranscript((prevTranscript) => {
        const lastTranscriptIndex = prevTranscript.length - 1;
        const lastTranscript =
          lastTranscriptIndex >= 0 ? prevTranscript[lastTranscriptIndex] : null;

        /*
            checking if the last item transcript matches with current uid 
            If yes then updating the last transcript msg with current text
            If no then adding a new entry in the transcript
          */
        if (lastTranscript && lastTranscript.uid === textstream.uid) {
          const updatedTranscript = {
            ...lastTranscript,
            text: lastTranscript.text + ' ' + currentFinalText,
          };

          return [
            ...prevTranscript.slice(0, lastTranscriptIndex),
            updatedTranscript,
          ];
        } else {
          return [
            ...prevTranscript,
            {
              uid: textstream.uid,
              time: new Date().getTime(),
              text: currentFinalText,
            },
          ];
        }
      });
    }

    /* 
     Previous final words of the uid are prepended and 
     then current non final words so that context of speech is not lost
    */
    const existingStringBuffer = isInterjecting
      ? ''
      : finalList?.current[textstream.uid]?.join(' ');
    const latestString = nonFinalText;
    const captionText =
      existingStringBuffer.length > 0
        ? existingStringBuffer + ' ' + latestString
        : latestString;

    // updating the captions
    setCaptionObj((prevState) => {
      return {
        ...prevState,
        [textstream.uid]: {
          text: captionText,
          lastUpdated: new Date().getTime(),
        },
      };
    });

    console.group('STT-logs');
    console.log('Recived uid =>', textstream.uid);
    console.log('PrevSpeaker uid =>', prevSpeakerRef.current);
    console.log('ActiveSpeaker uid=>', activeSpeakerRef.current);
    console.log('final List =>', finalList);
    console.groupEnd();
  };

  return {
    streamMessageCallback,
  };
};

export default useStreamMessageUtils;

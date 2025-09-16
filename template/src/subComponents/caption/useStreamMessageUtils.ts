import {useCaption} from './useCaption';
import {useSonioxCaption} from './soniox/useSonioxCaption';
import protoRoot from './proto/ptoto';
import PQueue from 'p-queue';

type StreamMessageCallback = (args: [number, Uint8Array]) => void;
type FinalListType = {
  [key: string]: string[];
};
type TranslationData = {
  lang: string;
  text: string;
  isFinal: boolean;
};
type FinalTranslationListType = {
  [key: string]: {
    [lang: string]: string[];
  };
};

const useStreamMessageUtils = (): {
  streamMessageCallback: StreamMessageCallback;
} => {
  // Azure STT context (bot ID 111111)
  const {
    setCaptionObj: setAzureCaptionObj,
    setMeetingTranscript: setAzureMeetingTranscript,
    activeSpeakerRef: azureActiveSpeakerRef,
    prevSpeakerRef: azurePrevSpeakerRef,
  } = useCaption();

  // Soniox STT context (bot ID 222222)
  const {
    setCaptionObj: setSonioxCaptionObj,
    setMeetingTranscript: setSonioxMeetingTranscript,
    activeSpeakerRef: sonioxActiveSpeakerRef,
    prevSpeakerRef: sonioxPrevSpeakerRef,
  } = useSonioxCaption();

  // Separate state for Azure (111111) and Soniox (222222)
  let azureCaptionStartTime: number = 0;
  let sonioxCaptionStartTime: number = 0;
  const azureFinalList: FinalListType = {};
  const azureFinalTranscriptList: FinalListType = {};
  const azureFinalTranslationList: FinalTranslationListType = {};
  const sonioxFinalList: FinalListType = {};
  const sonioxFinalTranscriptList: FinalListType = {};
  const sonioxFinalTranslationList: FinalTranslationListType = {};
  const queue = new PQueue({concurrency: 1});

  const streamMessageCallback: StreamMessageCallback = args => {
    const queueCallback = (args1: [number, Uint8Array]) => {
      /* uid - bot which sends stream message in channel
       payload - stream message in Uint8Array format
      */
      const [botUid, payload] = args1;
      
      // Route to appropriate caption system based on bot UID
      if (botUid === 111111) {
        // Azure STT processing
        processStreamMessage(payload, botUid, {
          captionStartTime: azureCaptionStartTime,
          setCaptionStartTime: (time) => { azureCaptionStartTime = time; },
          finalList: azureFinalList,
          finalTranscriptList: azureFinalTranscriptList,
          finalTranslationList: azureFinalTranslationList,
          setCaptionObj: setAzureCaptionObj,
          setMeetingTranscript: setAzureMeetingTranscript,
          activeSpeakerRef: azureActiveSpeakerRef,
          prevSpeakerRef: azurePrevSpeakerRef,
          logPrefix: 'azure-stt'
        });
      } else if (botUid === 222222) {
        // Soniox STT processing
        processStreamMessage(payload, botUid, {
          captionStartTime: sonioxCaptionStartTime,
          setCaptionStartTime: (time) => { sonioxCaptionStartTime = time; },
          finalList: sonioxFinalList,
          finalTranscriptList: sonioxFinalTranscriptList,
          finalTranslationList: sonioxFinalTranslationList,
          setCaptionObj: setSonioxCaptionObj,
          setMeetingTranscript: setSonioxMeetingTranscript,
          activeSpeakerRef: sonioxActiveSpeakerRef,
          prevSpeakerRef: sonioxPrevSpeakerRef,
          logPrefix: 'soniox-stt'
        });
      }
      // Ignore messages from other bot UIDs
    };
    
    (async () => {
      await queue.add(() => queueCallback(args));
      console.log('unified-stt- using pq queue');
    })();
  };

  // Helper function to process stream messages for either Azure or Soniox
  const processStreamMessage = (
    payload: Uint8Array,
    botUid: number,
    context: {
      captionStartTime: number;
      setCaptionStartTime: (time: number) => void;
      finalList: FinalListType;
      finalTranscriptList: FinalListType;
      finalTranslationList: FinalTranslationListType;
      setCaptionObj: any;
      setMeetingTranscript: any;
      activeSpeakerRef: any;
      prevSpeakerRef: any;
      logPrefix: string;
    }
  ) => {
    let nonFinalText = ''; // holds intermediate results
    let finalText = ''; // holds final strings
    let currentFinalText = ''; // holds current caption
    let isInterjecting = false;
    let translations: TranslationData[] = []; // holds translation data

    const textstream = protoRoot
      .lookupType('agora.audio2text.Text')
      .decode(payload as Uint8Array) as any;
    console.log(`${context.logPrefix} v7 textstream`, textstream);

    const finalWord = textstream.words.filter((word: any) => word.isFinal === true);
    
    // Speaker change detection
    if (
      textstream.uid !== context.activeSpeakerRef.current &&
      !(finalWord.length > 0 && textstream.uid === context.prevSpeakerRef.current)
    ) {
      // we have a speaker change so clear the context for prev speaker
      if (context.prevSpeakerRef.current !== '') {
        context.finalList[context.prevSpeakerRef.current] = [];
        // Clear translations for previous speaker
        if (context.finalTranslationList[context.prevSpeakerRef.current]) {
          Object.keys(context.finalTranslationList[context.prevSpeakerRef.current]).forEach(lang => {
            context.finalTranslationList[context.prevSpeakerRef.current][lang] = [];
          });
        }
        isInterjecting = true;
      }
      context.prevSpeakerRef.current = context.activeSpeakerRef.current;
      context.activeSpeakerRef.current = textstream.uid;
    }

    // Initialize arrays for new speakers
    if (!context.finalList[textstream.uid]) {
      context.finalList[textstream.uid] = [];
      context.finalTranscriptList[textstream.uid] = [];
    }

    // Process translations if available
    if (textstream.trans && textstream.trans.length > 0) {
      for (const trans of textstream.trans) {
        const lang = trans.lang;
        const texts = trans.texts || [];
        const isFinal = trans.isFinal || false;
        
        if (!context.finalTranslationList[textstream.uid]) {
          context.finalTranslationList[textstream.uid] = {};
        }
        if (!context.finalTranslationList[textstream.uid][lang]) {
          context.finalTranslationList[textstream.uid][lang] = [];
        }

        const currentTranslationText = texts.join(' ');
        if (currentTranslationText) {
          if (isFinal) {
            context.finalTranslationList[textstream.uid][lang].push(currentTranslationText);
          }
          
          // Build complete translation text (final + current non-final)
          const existingTranslationBuffer = isInterjecting 
            ? '' 
            : context.finalTranslationList[textstream.uid][lang]?.join(' ');
          const latestTranslationString = isFinal ? '' : currentTranslationText;
          const completeTranslationText = existingTranslationBuffer.length > 0
            ? (latestTranslationString ? existingTranslationBuffer + ' ' + latestTranslationString : existingTranslationBuffer)
            : latestTranslationString;
            
          if (completeTranslationText || isFinal) {
            translations.push({
              lang,
              text: completeTranslationText,
              isFinal,
            });
          }
        }
      }
    }

    const words = textstream.words;

    // Process words
    for (const word of words) {
      if (word.isFinal) {
        finalText = finalText + word.text;
      } else {
        nonFinalText =
          word.text !== '.' ? nonFinalText + word.text : nonFinalText;
        if (!context.captionStartTime) {
          context.setCaptionStartTime(performance.now());
        }
      }
    }

    if (finalText) {
      context.finalList[textstream.uid].push(finalText);
      context.finalTranscriptList[textstream.uid].push(finalText);
      currentFinalText = finalText;
      // log info to show measure the duration of passes in which a sentence gets finalized
      const duration = performance.now() - context.captionStartTime;
      console.log(
        `${context.logPrefix}-Time taken to finalize caption ${currentFinalText}: ${duration}ms`,
      );
      context.setCaptionStartTime(0); // Reset start time
    }

    /* Updating Meeting Transcript */
    if (currentFinalText.length) {
      //  final translations for transcript - include ALL available final translations for this user
      const finalTranslationsForTranscript: TranslationData[] = [];
      if (context.finalTranslationList[textstream.uid]) {
        Object.keys(context.finalTranslationList[textstream.uid]).forEach(lang => {
          const translationText = context.finalTranslationList[textstream.uid][lang]?.join(' ') || '';
          if (translationText) {
            finalTranslationsForTranscript.push({
              lang: lang,
              text: translationText,
              isFinal: true,
            });
          }
        });
      }

      context.setMeetingTranscript((prevTranscript: any) => {
        const lastTranscriptIndex = prevTranscript.length - 1;
        const lastTranscript =
          lastTranscriptIndex >= 0
            ? prevTranscript[lastTranscriptIndex]
            : null;

        /*
          checking if the last item transcript matches with current uid
          If yes then updating the last transcript msg with current text and translations
          If no then adding a new entry in the transcript
        */
        if (lastTranscript && lastTranscript.uid === textstream.uid) {
          const updatedTranscript = {
            ...lastTranscript,
            text: context.finalTranscriptList[textstream.uid].join(' '),
            translations: finalTranslationsForTranscript,
          };

          return [
            ...prevTranscript.slice(0, lastTranscriptIndex),
            updatedTranscript,
          ];
        } else {
          context.finalTranscriptList[textstream.uid] = [currentFinalText];

          return [
            ...prevTranscript,
            {
              uid: textstream.uid,
              time: new Date().getTime(),
              text: currentFinalText,
              translations: finalTranslationsForTranscript,
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
      : context.finalList[textstream.uid]?.join(' ');
    const latestString = nonFinalText;
    const captionText =
      existingStringBuffer.length > 0
        ? existingStringBuffer + ' ' + latestString
        : latestString;

    // updating the captions with both transcription and translations
    context.setCaptionObj((prevState: any) => {
      const existingTranslations = prevState[textstream.uid]?.translations || [];
      
      // Update existing translations or add new ones
      const updatedTranslations = [...existingTranslations];
      
      for (const newTrans of translations) {
        const existingIndex = updatedTranslations.findIndex(
          (t: any) => t.lang === newTrans.lang
        );
        
        if (existingIndex >= 0) {
          updatedTranslations[existingIndex] = newTrans;
        } else {
          updatedTranslations.push(newTrans);
        }
      }

      return {
        ...prevState,
        [textstream.uid]: {
          text: captionText || prevState[textstream.uid]?.text || '',
          translations: updatedTranslations,
          lastUpdated: new Date().getTime(),
        },
      };
    });
  };

  return {
    streamMessageCallback,
  };
};

export default useStreamMessageUtils;

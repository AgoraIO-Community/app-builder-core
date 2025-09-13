import {useSonioxCaption} from './useSonioxCaption';
import protoRoot from '../proto/ptoto';
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

const useSonioxStreamMessageUtils = (): {
  streamMessageCallback: StreamMessageCallback;
} => {
  const {
    setCaptionObj,
    setMeetingTranscript,
    activeSpeakerRef,
    prevSpeakerRef,
  } = useSonioxCaption();

  let captionStartTime: number = 0;
  const finalList: FinalListType = {};
  const finalTranscriptList: FinalListType = {};
  const finalTranslationList: FinalTranslationListType = {};
  const queue = new PQueue({concurrency: 1});

  const streamMessageCallback: StreamMessageCallback = args => {
    const queueCallback = (args1: [number, Uint8Array]) => {
      /* uid - bot which sends stream message in channel
       payload - stream message in Uint8Array format
      */
      const [uid, payload] = args1;
      
      // Filter for Soniox bot ID 222222 only
      if (uid !== 222222) {
        return;
      }
      
      let nonFinalText = ''; // holds intermediate results
      let finalText = ''; // holds final strings
      let currentFinalText = ''; // holds current caption
      let isInterjecting = false;
      let translations: TranslationData[] = []; // holds translation data

      const textstream = protoRoot
        .lookupType('agora.audio2text.Text')
        .decode(payload as Uint8Array) as any;
      console.log('soniox stt v7 textstream', textstream);

      // Identifing Current & Prev Speakers for the Captions
      const finalWord = textstream.words.filter((word: any) => word.isFinal === true);
      // when we only get final word for the previous speaker then don't flip previous speaker as active but update in place.

      if (
        textstream.uid !== activeSpeakerRef.current &&
        !(finalWord.length > 0 && textstream.uid === prevSpeakerRef.current)
      ) {
        // we have a speaker change so clear the context for prev speaker
        if (prevSpeakerRef.current !== '') {
          finalList[prevSpeakerRef.current] = [];
          // Clear translations for previous speaker
          if (finalTranslationList[prevSpeakerRef.current]) {
            Object.keys(finalTranslationList[prevSpeakerRef.current]).forEach(lang => {
              finalTranslationList[prevSpeakerRef.current][lang] = [];
            });
          }
          isInterjecting = true;
        }
        prevSpeakerRef.current = activeSpeakerRef.current;
        activeSpeakerRef.current = textstream.uid;
      }

      /* creating [] for each user to store their complete transcripts
       initializing captions state for cuurent speaker
       ex: {282190954:[]}
    */
      if (!finalList[textstream.uid]) {
        finalList[textstream.uid] = [];
        finalTranscriptList[textstream.uid] = [];
      }

      // Process translations if available
      if (textstream.trans && textstream.trans.length > 0) {
        for (const trans of textstream.trans) {
          const lang = trans.lang;
          const texts = trans.texts || [];
          const isFinal = trans.isFinal || false;
          
          if (!finalTranslationList[textstream.uid]) {
            finalTranslationList[textstream.uid] = {};
          }
          if (!finalTranslationList[textstream.uid][lang]) {
            finalTranslationList[textstream.uid][lang] = [];
          }

          const currentTranslationText = texts.join(' ');
          if (currentTranslationText) {
            if (isFinal) {
              finalTranslationList[textstream.uid][lang].push(currentTranslationText);
            }
            
            // Build complete translation text (final + current non-final)
            const existingTranslationBuffer = isInterjecting 
              ? '' 
              : finalTranslationList[textstream.uid][lang]?.join(' ');
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

      const words = textstream.words; //[Word,Word]

      for (const word of words) {
        if (word.isFinal) {
          finalText = finalText + word.text;
        } else {
          nonFinalText =
            word.text !== '.' ? nonFinalText + word.text : nonFinalText;
          if (!captionStartTime) {
            captionStartTime = performance.now();
          }
        }
      }

      if (finalText) {
        finalList[textstream.uid].push(finalText);
        finalTranscriptList[textstream.uid].push(finalText);
        currentFinalText = finalText;
        // log info to show measure the duration of passes in which a sentence gets finalized
        const duration = performance.now() - captionStartTime;
        console.log(
          `soniox-stt-Time taken to finalize caption ${currentFinalText}: ${duration}ms`,
        );
        captionStartTime = null; // Reset start time
      }

      /* Updating Meeting Transcript */
      if (currentFinalText.length) {
        //  final translations for transcript - include ALL available final translations for this user
        const finalTranslationsForTranscript: TranslationData[] = [];
        if (finalTranslationList[textstream.uid]) {
          Object.keys(finalTranslationList[textstream.uid]).forEach(lang => {
            const translationText = finalTranslationList[textstream.uid][lang]?.join(' ') || '';
            if (translationText) {
              finalTranslationsForTranscript.push({
                lang: lang,
                text: translationText,
                isFinal: true,
              });
            }
          });
        }

        setMeetingTranscript(prevTranscript => {
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
              //text: lastTranscript.text + ' ' + currentFinalText, // missing few updates with reading prev values
              text: finalTranscriptList[textstream.uid].join(' '),
              translations: finalTranslationsForTranscript,
            };

            return [
              ...prevTranscript.slice(0, lastTranscriptIndex),
              updatedTranscript,
            ];
          } else {
            finalTranscriptList[textstream.uid] = [currentFinalText];

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
        : finalList[textstream.uid]?.join(' ');
      const latestString = nonFinalText;
      const captionText =
        existingStringBuffer.length > 0
          ? existingStringBuffer + ' ' + latestString
          : latestString;

      // updating the captions with both transcription and translations
      setCaptionObj(prevState => {
        const existingTranslations = prevState[textstream.uid]?.translations || [];
        
        // Update existing translations or add new ones
        const updatedTranslations = [...existingTranslations];
        
        for (const newTrans of translations) {
          const existingIndex = updatedTranslations.findIndex(
            t => t.lang === newTrans.lang
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
    (async () => {
      await queue.add(() => queueCallback(args));
      console.log('soniox-stt- using pq queue');
    })();
  };

  return {
    streamMessageCallback,
  };
};

export default useSonioxStreamMessageUtils;
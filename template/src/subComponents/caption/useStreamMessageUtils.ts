import React, {useState, useRef, useEffect} from 'react';
import {useCaption} from './useCaption';
import {formatTime} from './utils';
import protoRoot from './proto/ptoto';
import {useRender} from 'customization-api';

type StreamMessageCallback = (args: [number, Uint8Array]) => void;
type FinalListType = {
  [key: string]: string[];
};

const useStreamMessageUtils = (): {
  streamMessageCallback: StreamMessageCallback;

  downloadTranscript: () => void;
} => {
  const {captionObj, meetingTranscript, setCaptionObj, setMeetingTranscript} =
    useCaption();
  const meetingTranscriptRef = useRef(meetingTranscript);
  const startTimeRef = useRef<number>(0);
  const finalList = useRef<FinalListType>({});
  const {renderList} = useRender();
  const renderListRef = useRef({renderList});

  useEffect(() => {
    renderListRef.current.renderList = renderList;
  }, [renderList]);

  //  handles the stream messages and updates the state variables.
  const streamMessageCallback: StreamMessageCallback = (args) => {
    const [uid, payload] = args; // uid is of the bot which sends the stream messages in the channel
    let nonFinalList = []; // holds intermediate results
    let currentText = ''; // holds current caption
    const textstream = protoRoot
      .lookupType('Text')
      .decode(payload as Uint8Array) as any;
    console.log('STT - Parsed Textstream : ', textstream);

    const userName =
      renderListRef.current.renderList[textstream.uid]?.name || 'Speaker'; // identifying speaker of caption

    // creating [] for each user to store thier complete transcripts

    if (!finalList.current[textstream.uid]) {
      finalList.current[textstream.uid] = [];
    }

    const words = textstream.words;

    // categorize words into final & nonFinal objects per uid
    //{112:['hi','2','4'],113:['hello']}
    words.map((word) => {
      if (word.isFinal) {
        finalList.current[textstream.uid].push(word.text);

        currentText += word.text;

        const duration = performance.now() - startTimeRef.current;
        console.log(
          `stt-Time taken to finalize caption ${currentText}: ${duration}ms`,
        );
        startTimeRef.current = null; // Reset start time
      } else {
        nonFinalList.push(word.text);
        if (!startTimeRef.current) {
          startTimeRef.current = performance.now();
        }
      }
    });

    if (currentText.length) {
      let flag = false;
      // check for last itm only
      meetingTranscriptRef.current.forEach((item) => {
        if (
          item.uid == textstream.uid &&
          new Date().getTime() - item.time < 30000
        ) {
          item.text = item.text + ' ' + currentText;
          flag = true;
          // update existing transcript for uid & time
        }
      });

      if (!flag) {
        // update with prev history
        meetingTranscriptRef.current.push({
          name: userName,
          uid: textstream.uid, //1
          time: new Date().getTime(), // t1  //textstream.time, // textstream.time returing value 699391063 - which is not comparable with timestamp
          text: currentText,
        });
      }
      // 1 4.01  1 4.02  1.4.06

      // update the last update only
      // chnage setMeetTranscipt to ref setMeetingTranscriptRef.current = meetingTranscriptRef.current
      setMeetingTranscript((prevTranscript) => {
        return [...meetingTranscriptRef.current];
      });
    }

    // including prev references of the caption
    let stringBuilder = finalList?.current[textstream.uid]?.join(' ');
    stringBuilder += stringBuilder?.length > 0 ? ' ' : '';
    stringBuilder += nonFinalList?.join(' ');

    // when stringBuilder is '' then it will clear the live captions when person stops speaking or mic muted
    if (textstream.words.length === 0) {
      stringBuilder = '';
    }

    setCaptionObj((prevState) => ({
      ...prevState,
      [textstream.uid]: stringBuilder,
    }));

    if (textstream.words.length === 0) {
      // clearing prev sel when there is pause so that live captions show current spoken words
      finalList.current[textstream.uid] = [];
    }

    console.group('STT-logs');
    console.log('stt-finalList =>', finalList.current);
    console.log('stt - meeting transcript =>', meetingTranscriptRef.current);
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

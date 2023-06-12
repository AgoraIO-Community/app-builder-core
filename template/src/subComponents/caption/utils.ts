import protoRoot from './proto/ptoto';

export const streamMessageCallback = (args, sttObj) => {
  const {
    renderListRef,
    finalList,
    meetingTextRef,
    startTimeRef,
    meetingTranscriptRef,
    setMeetingTranscript,
    setTextObj,
  } = sttObj;
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
  words.map((word) => {
    if (word.isFinal) {
      finalList.current[textstream.uid].push(word.text);
      if (meetingTextRef.current.length > 0) {
        meetingTextRef.current += ' ';
      }
      currentText += word.text;
      meetingTextRef.current += word.text;
      const duration = performance.now() - startTimeRef.current;
      console.log(
        `Time taken to finalize caption ${currentText}: ${duration}ms`,
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
        uid: textstream.uid,
        time: new Date().getTime(), //textstream.time, // textstream.time returing value 699391063 - which is not comparable with timestamp
        text: currentText,
      });
    }

    setMeetingTranscript((prevTranscript) => {
      return [...meetingTranscriptRef.current];
    });
  }

  // including prev references of the caption
  let stringBuilder = finalList?.current[textstream.uid]?.join(' ');
  stringBuilder += stringBuilder?.length > 0 ? ' ' : '';
  stringBuilder += nonFinalList?.join(' ');

  // when stringBuilder is '' then it will clear the live captions when person stops speaking
  if (textstream.words.length === 0) {
    stringBuilder = '';
  }
  setTextObj((prevState) => ({
    ...prevState,
    [textstream.uid]: stringBuilder,
  }));

  if (textstream.words.length === 0) {
    // clearing prev sel when empty words
    finalList.current[textstream.uid] = [];
  }

  console.group('STT-logs');
  console.log('stt-finalList =>', finalList.current);
  console.log('stt - all meeting text =>', meetingTextRef.current);
  console.log('stt - meeting transcript =>', meetingTranscriptRef.current);
  console.log('stt - current text =>', currentText);
  console.groupEnd();
};

export const downloadTranscript = async (data) => {
  //for native need to have react-native-blob
  try {
    const formattedContent = data
      .map(
        (item) => `${item.name} ${formatTime(Number(item.time))}: ${item.text}`,
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

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  //const s = d.getSeconds().toString().padStart(2, '0');
  const suffix = h >= 12 ? 'PM' : 'AM';
  const H = h % 12 || 12;
  return `${H}:${m} ${suffix}`;
}

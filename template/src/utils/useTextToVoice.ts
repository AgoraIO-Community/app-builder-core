import {Base64} from '../ai-agent/utils';
import {AudioData} from './testData';

const RIMI_API_TOKEN = `Rl8b_9inNeP0l4tOoapYOcl_mjnYig7jmbS-5XGuLlo`;

export function useTextToVoice() {
  function base64ToBinary(base64String) {
    const binaryString = Base64.atob(base64String);
    return binaryString;
  }

  function binaryStringToUint8Array(binaryString) {
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  function createBlobFromUint8Array(uint8Array) {
    const blob = new Blob([uint8Array], {type: 'audio/mpeg'});
    return blob;
  }

  function createURLFromBlob(blob) {
    return URL.createObjectURL(blob);
  }

  function playAudio(audioURL) {
    const audio = new Audio(audioURL);
    audio.play();
  }

  function base64ToMp3(base64String) {
    const binaryString = base64ToBinary(base64String);
    const uint8Array = binaryStringToUint8Array(binaryString);
    const blob = createBlobFromUint8Array(uint8Array);
    const audioURL = createURLFromBlob(blob);
    return audioURL;
  }

  const convertTextToBase64Audio = async text => {
    try {
      const options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${RIMI_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          speaker: 'abbie',
          text: text,
          //default is mist
          //modelId: 'mist',
          lang: 'eng',
          audioFormat: 'mp3',
          samplingRate: 22050,
          speedAlpha: 1.0,
          reduceLatency: false,
        }),
      };
      const response = await fetch(
        'https://users.rime.ai/v1/rime-tts',
        options,
      );
      const data = await response.json();
      if (data && data?.audioContent) {
        return Promise.resolve(data?.audioContent);
      }
    } catch (error) {
      console.error(
        'Error on useTextToVoice - convertTextToBase64Audio',
        error,
      );
      return Promise.reject(error);
    }
  };

  const textToVoice = async text => {
    try {
      //api to convert text to base64 audio data
      const base64String = await convertTextToBase64Audio(text);
      //for testing
      //const base64String = AudioData.audioContent;
      //base64 to mp3
      const audioURL = base64ToMp3(base64String);

      //Play the audio
      playAudio(audioURL);

      return Promise.resolve(audioURL);
    } catch (error) {
      console.error('Error on useTextToVoice - textToVoice', error);
      return Promise.reject(error);
    }
  };

  const decodeAndPlayAudio = audioContent => {
    try {
      //base64 to mp3
      const audioURL = base64ToMp3(audioContent);
      //Play the audio
      playAudio(audioURL);
    } catch (error) {
      console.error('Error on useTextToVoice - decodeAndPlayAudio', error);
    }
  };

  return {convertTextToBase64Audio, decodeAndPlayAudio, textToVoice};
}

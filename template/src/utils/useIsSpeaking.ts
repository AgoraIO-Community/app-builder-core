import hark from 'hark';
import {useEffect, useRef} from 'react';
const useIsSpeaking = () => {
  const speechRef = useRef(null);
  useEffect(() => {
    try {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
        })
        .then((audioStream) => {
          speechRef.current = hark(audioStream, {});
          speechRef.current.on('speaking', function () {
            console.log('debugging Speaking!');
          });
          speechRef.current.on('stopped_speaking', function () {
            console.log('debugging stopped_speaking');
          });
        })
        .catch((error) => {
          console.log('debugging error', error);
        });
    } catch (error) {
      console.log('debugging error', error);
    }
    return () => {
      speechRef.current?.stop && speechRef.current?.stop();
    };
  }, []);
  return null;
};
export default useIsSpeaking;

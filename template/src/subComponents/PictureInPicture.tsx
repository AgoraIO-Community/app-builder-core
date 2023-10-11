import {
  useActiveSpeaker,
  useContent,
  useLocalUserInfo,
} from 'customization-api';
import React, {useEffect, useRef, useState} from 'react';

const PictureInPicture = () => {
  const [isPipEnabled, setPipEnabled] = useState(false);
  const {defaultContent} = useContent();
  const {uid} = useLocalUserInfo();
  const activeSpeaker = useActiveSpeaker();
  const [lastSpeaker, setlastSpeaker] = useState(activeSpeaker);
  const lastSpeakerRef = useRef(lastSpeaker);
  const streamRef = useRef<any>();
  const isPipEnabledRef = useRef(isPipEnabled);
  const defaultContentRef = useRef<any>(defaultContent);

  useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  useEffect(() => {
    lastSpeakerRef.current = lastSpeaker;
  }, [lastSpeaker]);

  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        //console.log("debugging pip enabled");
        setPipEnabled(true);
      } else {
        //console.log("debugging pip disabled");
        setPipEnabled(false);
      }
    });
  }, []);

  useEffect(() => {
    isPipEnabledRef.current = isPipEnabled;
    if (isPipEnabled) {
      //console.log('debugging pip enabled triggered');
      if (streamRef.current) {
        //console.log('debugging stream is available', streamRef.current);
        const pipVideo: any = document.getElementById('pip-mode-video');
        pipVideo.srcObject = streamRef.current;
        pipVideo.play();
        setTimeout(() => {
          enablePipMode();
        }, 100);
      }
    } else {
      //console.log('debugging pip disabled triggered');
      disablePipMode();
    }
  }, [isPipEnabled]);

  useEffect(() => {
    if (
      activeSpeaker &&
      activeSpeaker !== lastSpeaker &&
      defaultContentRef.current[activeSpeaker]?.video
    ) {
      //console.log('debugging active speaker ', activeSpeaker);
      const stream =
        activeSpeaker === uid
          ? window.engine.localStream.video
          : window.engine.remoteStreams.get(activeSpeaker)?.video;
      //console.log('debugging latest stream', stream);
      if (stream) {
        const clonedMediaStreamTrack = stream.getMediaStreamTrack().clone();
        const clonedMediaStream = new MediaStream([clonedMediaStreamTrack]);
        streamRef.current = clonedMediaStream;
        if (isPipEnabledRef.current) {
          //console.log('debugging new playing stream');
          const pipVideo: any = document.getElementById('pip-mode-video');
          pipVideo.srcObject = streamRef.current;
          pipVideo.play();
        }
      }
    }
    if (activeSpeaker) {
      setlastSpeaker(activeSpeaker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSpeaker]);

  const disablePipMode = async () => {
    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch (error) {
        console.log('debugging error on exitPictureInPicture', error);
      }
    }
    try {
      const pipVideo: any = document.getElementById('pip-mode-video');
      if (pipVideo && pipVideo?.stop) {
        pipVideo.stop();
      }
    } catch (error) {
      console.log('debugging error on stopping video');
    }
  };

  const enablePipMode = async () => {
    try {
      const pipVideo = document.getElementById('pip-mode-video');
      if (pipVideo) {
        //@ts-ignore
        await pipVideo.requestPictureInPicture();
      } else {
        //console.log("debugging couldn't find the video feed tag");
      }
    } catch (error) {
      console.log('debugging error on enabling pip', error);
    }
  };

  // eslint-disable-next-line react-native/no-inline-styles
  return <video autoPlay style={{display: 'none'}} id="pip-mode-video" />;
};

export default PictureInPicture;

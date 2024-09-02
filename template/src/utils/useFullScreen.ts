import {useEffect, useRef} from 'react';
import {useContent, useLocalUserInfo} from 'customization-api';
import {UidType} from '../../agora-rn-uikit';
import {isWebInternal} from '../utils/common';
import {logger, LogSource} from '../logger/AppBuilderLogger';

export const useFullScreen = () => {
  const {uid: localUid, screenUid: localScreenUid} = useLocalUserInfo();
  const {defaultContent} = useContent();
  const defaultContentRef = useRef(defaultContent);

  useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  const onFullScreenChange = () => {
    setTimeout(() => {
      try {
        if (
          document.fullscreenElement &&
          screen?.orientation?.type?.startsWith('portrait')
        ) {
          //@ts-ignore
          screen?.orientation?.lock &&
            //@ts-ignore
            screen?.orientation?.lock('landscape')?.catch(e => {
              console.error('debugging error on lock', e);
            });
        }
      } catch (error) {
        console.error('debugging error on onFullScreenChange', error);
      }
    }, 500);
  };

  useEffect(() => {
    try {
      document?.addEventListener('fullscreenchange', onFullScreenChange);
    } catch (error) {}

    return () => {
      document?.removeEventListener('fullscreenchange', onFullScreenChange);
    };
  }, []);

  const requestFullscreen = async (uid: UidType) => {
    if (!document?.fullscreenEnabled) {
      console.error('Full screen API - Not supported');
      return Promise.reject(false);
    }

    if (!isWebInternal()) {
      console.error('Full screen API - only available web platform');
      return Promise.reject(false);
    }

    if (!uid) {
      console.error("Full screen API - Uid can't be empty");
      return Promise.reject(false);
    }

    let isVideoEnabled = defaultContentRef?.current[uid]?.video;

    if (!isVideoEnabled) {
      console.error(
        `Full screen API - please enable video for uid - ${uid} before calling full screen api`,
      );
      return Promise.reject(false);
    }

    let fullScreenUid = uid === localUid ? 0 : uid === localScreenUid ? 1 : uid;

    try {
      /**
       * Agora assign user uid in the video tag container element
       * 0 - local user
       * 1 - local screen
       * actual user uid - for rest of remote stream
       *
       * agora assign uid to parent div of video element
       * so that's reason we are access children element to get the video element
       *
       * we can requestFullScreen for parent div
       * but it won't have auto rotate as soon fullscreen enabled and timer/exit full screen buttons
       *
       * Sample structure
       * <div id="0" >
       *   <div>
       *    <video />
       *   </div>
       * </div>
       *  */
      const videoTag = document.getElementById(fullScreenUid?.toString())
        ?.children[0]?.children[0];

      if (!document?.fullscreenElement && videoTag?.requestFullscreen) {
        videoTag
          ?.requestFullscreen()
          .then(() => {
            logger.log(
              LogSource.Internals,
              'FULL_SCREEN',
              'requestFullscreen success',
            );
            return Promise.resolve(true);
          })
          .catch(error => {
            logger.error(
              LogSource.Internals,
              'FULL_SCREEN',
              'requestFullscreen - error',
              error,
            );
            return Promise.reject(false);
          });
      } else {
        logger.error(
          LogSource.Internals,
          'FULL_SCREEN',
          'requestFullscreen - error',
        );
        return Promise.reject(false);
      }
    } catch (error) {
      logger.log(
        LogSource.Internals,
        'FULL_SCREEN',
        'requestFullscreen error',
        error,
      );
      return Promise.reject(false);
    }
  };

  const exitFullScreen = () => {
    try {
      if (document?.fullscreenElement) {
        document?.exitFullscreen();
        logger.log(
          LogSource.Internals,
          'FULL_SCREEN',
          'exitFullscreen success',
        );
        return true;
      } else {
        console.error('Full screen AI - there is no fullscreen element');
        return false;
      }
    } catch (error) {
      logger.error(
        LogSource.Internals,
        'FULL_SCREEN',
        'exitFullscreen error',
        error,
      );
      return false;
    }
  };

  return {requestFullscreen, exitFullScreen};
};

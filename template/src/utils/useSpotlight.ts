import {DispatchContext, useContent} from 'customization-api';
import {useContext, useEffect} from 'react';
import {EventNames} from '../rtm-events';
import events from '../rtm-events-api';

export const useSpotlight = () => {
  const {spotlightUid} = useContent();
  const {dispatch} = useContext(DispatchContext);

  useEffect(() => {
    events.on(EventNames.SPOTLIGHT_USER_CHANGED, ({payload}) => {
      if (payload) {
        const data = JSON.parse(payload);
        if (data && data?.user_id) {
          setSpotlightUid(data?.user_id);
        } else {
          setSpotlightUid(0);
        }
      }
    });
  }, []);

  const setSpotlightUid = (uid: number) => {
    dispatch({
      type: 'Spotlight',
      value: [uid],
    });
  };

  return {spotlightUid, setSpotlightUid};
};

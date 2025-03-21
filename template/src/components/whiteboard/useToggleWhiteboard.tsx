import {useContext} from 'react';
import {whiteboardContext} from './WhiteboardConfigure';
import {useContent, useLayout} from 'customization-api';
import {DispatchContext} from '../../../agora-rn-uikit';
import {EventNames} from '../../rtm-events';
import events, {PersistanceLevel} from '../../rtm-events-api';
import WhiteboardWrapper from './../whiteboard/WhiteboardWrapper';

export const useToggleWhiteboard = () => {
  const {
    whiteboardActive,
    joinWhiteboardRoom,
    leaveWhiteboardRoom,
    getWhiteboardUid,
  } = useContext(whiteboardContext);
  const {setCustomContent} = useContent();
  const {setLayout} = useLayout();
  const {dispatch} = useContext(DispatchContext);
  return () => {
    if ($config.ENABLE_WHITEBOARD) {
      if (whiteboardActive) {
        leaveWhiteboardRoom();
        setCustomContent(getWhiteboardUid(), false);
        setLayout('grid');
        events.send(
          EventNames.WHITEBOARD_ACTIVE,
          JSON.stringify({status: false}),
          PersistanceLevel.Session,
        );
      } else {
        joinWhiteboardRoom();
        setCustomContent(getWhiteboardUid(), WhiteboardWrapper, {}, true);
        dispatch({
          type: 'UserPin',
          value: [getWhiteboardUid()],
        });
        setLayout('pinned');
        events.send(
          EventNames.WHITEBOARD_ACTIVE,
          JSON.stringify({status: true}),
          PersistanceLevel.Session,
        );
      }
    }
  };
};

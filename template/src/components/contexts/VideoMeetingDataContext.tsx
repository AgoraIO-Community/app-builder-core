import React, {createContext, useState, useEffect, useContext} from 'react';
import {createHook} from 'customization-implementation';
import {UidType, useLocalUid} from '../../../agora-rn-uikit';
import {useMeetingInfo} from '../meeting-info/useMeetingInfo';
import events, {EventPersistLevel} from '../../rtm-events-api';
import {EventNames} from '../../rtm-events';
import ChatContext from '../ChatContext';

export interface VideoMeetingDataInterface {
  hostUids: UidType[];
  attendeeUids: UidType[];
}
const VideoMeetingData = createContext<VideoMeetingDataInterface>({
  hostUids: [],
  attendeeUids: [],
});

interface VideoMeetingDataProviderProps {
  children: React.ReactNode;
}
const VideoMeetingDataProvider = (props: VideoMeetingDataProviderProps) => {
  const {
    data: {isHost},
  } = useMeetingInfo();
  const {hasUserJoinedRTM} = useContext(ChatContext);
  const localUid = useLocalUid();
  const [hostUids, setHostUids] = useState<UidType[]>([]);
  const [attendeeUids, setAttendeeUids] = useState<UidType[]>([]);

  useEffect(() => {
    //set local uid
    isHost ? setHostUids([localUid]) : setAttendeeUids([localUid]);

    //listen for remote user role
    //if remote user is host then add it in the hostUids
    events.on(EventNames.VIDEO_MEETING_HOST, (data) => {
      const payload = JSON.parse(data?.payload);
      const hostUid = payload?.uid;
      if (hostUid && hostUids.indexOf(hostUid) === -1) {
        setHostUids((prevState) => [...prevState, hostUid]);
      }
    });

    //if remote user is not host then add it in the attendeeUids
    events.on(EventNames.VIDEO_MEETING_ATTENDEE, (data) => {
      const payload = JSON.parse(data?.payload);
      const attendeeUid = payload?.uid;
      if (attendeeUid && attendeeUids.indexOf(attendeeUid) === -1) {
        setAttendeeUids((prevState) => [...prevState, attendeeUid]);
      }
    });

    return () => {
      events.off(EventNames.VIDEO_MEETING_HOST);
      events.off(EventNames.VIDEO_MEETING_ATTENDEE);
    };
  }, []);

  useEffect(() => {
    //hasUserJoinedRTM ensure that RTM login successful and events can be sent.
    if (hasUserJoinedRTM) {
      //send user role event so newly joining user will get the previous user role details
      events.send(
        isHost
          ? EventNames.VIDEO_MEETING_HOST
          : EventNames.VIDEO_MEETING_ATTENDEE,
        JSON.stringify({uid: localUid}),
        EventPersistLevel.LEVEL2,
      );
    }
  }, [isHost, hasUserJoinedRTM]);

  return (
    <VideoMeetingData.Provider
      value={{
        hostUids,
        attendeeUids,
      }}>
      {props.children}
    </VideoMeetingData.Provider>
  );
};
const useVideoMeetingData = createHook(VideoMeetingData);

export {useVideoMeetingData, VideoMeetingDataProvider};

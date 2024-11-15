import {useVideoMeetingData} from '../components/contexts/VideoMeetingDataContext';

export const useGetHostIds = () => {
  const {hostUids} = useVideoMeetingData();
  return hostUids;
};

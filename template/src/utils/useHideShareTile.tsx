import {useSetRoomInfo} from '../components/room-info/useSetRoomInfo';

export const useHideShareTitle = () => {
  const {setRoomInfo} = useSetRoomInfo();
  return (disableShareTile: boolean) => {
    setRoomInfo(prevState => {
      return {
        ...prevState,
        roomPreference: {
          ...prevState?.roomPreference,
          disableShareTile: disableShareTile,
        },
      };
    });
  };
};

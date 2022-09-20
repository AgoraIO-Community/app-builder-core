import useSetName from './useSetName';
import useGetName from './useGetName';

export default function useUserName(): [
  string,
  React.Dispatch<React.SetStateAction<string>>,
] {
  const setName = useSetName();
  const name = useGetName();
  return [name, setName];
}

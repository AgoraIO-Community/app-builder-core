import {useParams} from '../components/Router';

export default function useNavParams() {
  const data = useParams();
  return data;
}

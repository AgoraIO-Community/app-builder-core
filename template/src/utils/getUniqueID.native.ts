import 'react-native-get-random-values';
import {nanoid} from 'nanoid';

export default function getUniqueID() {
  return nanoid();
}

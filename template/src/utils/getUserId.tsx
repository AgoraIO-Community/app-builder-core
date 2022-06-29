import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';
import AsyncStorage from '@react-native-community/async-storage';

export default async function getUserId() {
  let userId = await AsyncStorage.getItem('UserId');
  if (!userId) {
    userId = uuid();
    await AsyncStorage.setItem('UserId', userId);
  }
  return userId;
}

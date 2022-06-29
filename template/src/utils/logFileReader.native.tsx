import {Platform} from 'react-native';
import mobileAndTabletCheck from './mobileWebTest';
import RNFS from 'react-native-fs';

const ReadLogFiles = async () => {
  if (!mobileAndTabletCheck()) return null;

  if (Platform.OS === 'android') {
    var logFiles = await RNFS.readdir(RNFS.ExternalDirectoryPath);
    console.log('FILES', RNFS.ExternalDirectoryPath, logFiles);
  }
  if (Platform.OS === 'ios') {
    var logFiles = await RNFS.readdir(RNFS.CachesDirectoryPath);
    console.log('FILES', RNFS.CachesDirectoryPath, logFiles);
  }
};

export default ReadLogFiles;

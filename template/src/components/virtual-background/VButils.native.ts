import AsyncStorage from '@react-native-async-storage/async-storage';
import {LogSource, logger} from '../../logger/AppBuilderLogger';

export const saveImagesToAsyncStorage = async (
  base64Data: string,
): Promise<void> => {
  try {
    const timestampId = new Date().getTime();
    const key = `image_${timestampId}`;

    await AsyncStorage.setItem(key, base64Data);
    logger.debug(
      LogSource.Internals,
      'VIRTUAL_BACKGROUND',
      `Image saved to AsyncStorage with key - ${key}`,
    );
  } catch (error) {
    logger.error(
      LogSource.Internals,
      'VIRTUAL_BACKGROUND',
      'Error saving image to AsyncStorage',
      error,
    );
  }
};

export const retrieveImagesFromStorage = async (): Promise<string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();

    // filtering out keys that are saved for VB
    const imageKeys = keys.filter(key => key.startsWith('image_'));
    const retrievedImages: string[] = await Promise.all(
      imageKeys.map(async key => {
        const imageData = await AsyncStorage.getItem(key);
        return imageData || '';
      }),
    );

    logger.debug(
      LogSource.Internals,
      'VIRTUAL_BACKGROUND',
      'Retrieved images from AsyncStorage:',
      retrievedImages,
    );
    return retrievedImages;
  } catch (error) {
    logger.error(
      LogSource.Internals,
      'VIRTUAL_BACKGROUND',
      'IError retrieving image from AsyncStorage',
      error,
    );
    throw error;
  }
};

export const convertBlobToBase64 = async (blobURL: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fetch(blobURL)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
};

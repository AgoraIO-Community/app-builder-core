import {getParamFromURL} from './common';

export const isRecordingBotRoute = history => {
  const bot = getParamFromURL(history.location.search, 'bot');
  const token = getParamFromURL(history.location.search, 'token');
  return bot && token;
};

export const getRecordingBotToken = history => {
  const token = getParamFromURL(history.location.search, 'token');
  return token;
};

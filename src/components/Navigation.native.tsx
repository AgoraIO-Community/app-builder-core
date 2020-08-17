import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {useHistory} from './Router';

const processUrl = (url: string): string => {
  return url
    .replace('my-scheme://my-host', '')
    .replace('https://agora-meet.netlify.app', '');
};

const Navigation = () => {
  const history = useHistory();
  useEffect(() => {
    const deepLinkUrl = (link: string | null) => {
      console.log('Deep-linking url: ', link);
      if (link !== null) {
        history.push(processUrl(link));
      }
    };
    const deepLink = async () => {
      const initialUrl = await Linking.getInitialURL();
      Linking.addEventListener('url', (e) => deepLinkUrl(e.url));
      deepLinkUrl(initialUrl);
    };
    deepLink();
  }, [history]);
  return <></>;
};

export default Navigation;

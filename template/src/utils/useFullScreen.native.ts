export const useFullScreen = () => {
  const requestFullscreen = async () => {
    console.error('Full screen API not supported for native');
    return Promise.reject(false);
  };

  const exitFullScreen = () => {
    console.error('Full screen API not supported for native');
  };

  return {requestFullscreen, exitFullScreen};
};

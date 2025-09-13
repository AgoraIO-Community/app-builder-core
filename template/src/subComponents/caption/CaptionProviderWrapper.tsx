import React from 'react';
import {CaptionProvider} from './useCaption';
import {SonioxCaptionProvider} from './soniox/useSonioxCaption';

interface CaptionProviderWrapperProps {
  callActive?: boolean;
  children: React.ReactNode;
}

const CaptionProviderWrapper: React.FC<CaptionProviderWrapperProps> = ({
  callActive,
  children,
}) => {
  return (
    <CaptionProvider callActive={callActive}>
      {$config.ENABLE_SONIOX_STT ? (
        <SonioxCaptionProvider callActive={callActive}>
          {children}
        </SonioxCaptionProvider>
      ) : (
        children
      )}
    </CaptionProvider>
  );
};

export default CaptionProviderWrapper;
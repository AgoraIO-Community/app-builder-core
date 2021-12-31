import React from 'react';

function useImageDelay(
  elementRef: any,
  delay: number | null,
  imageName: string,
) {
  // Remember the latest callback if it changes.
  React.useEffect(() => {
    // The following block allows to repaint the icon
    let imageElement: any;
    if (elementRef && elementRef.current) {
      const imageContainer = elementRef.current as any;
      if (imageContainer && imageContainer.children.length > 0) {
        imageElement = imageContainer.children[0];
        imageElement.style.display = 'none';
      }
    }
    const timer = setTimeout(() => {
      if (imageElement) {
        imageElement.style.display = 'initial';
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [imageName]);
}

export default useImageDelay;

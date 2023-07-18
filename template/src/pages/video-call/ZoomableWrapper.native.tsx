import {ReactNativeZoomableView} from '@openspacelabs/react-native-zoomable-view';
import React from 'react';
import {View} from 'react-native';
const ZoomableWrapper = (props) => {
  if (!props?.enableZoom) {
    return <>{props.children}</>;
  }
  return (
    <View
      style={{
        flexShrink: 1,
        height: '100%',
        width: '100%',
      }}>
      <ReactNativeZoomableView
        maxZoom={30}
        zoomStep={1}
        initialZoom={1}
        style={{
          flex: 1,
        }}>
        {props.children}
      </ReactNativeZoomableView>
    </View>
  );
};
export default ZoomableWrapper;

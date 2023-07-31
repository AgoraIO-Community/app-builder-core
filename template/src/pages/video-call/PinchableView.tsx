import React from 'react';
import {Animated} from 'react-native';
import {PinchGestureHandler, State} from 'react-native-gesture-handler';
const USE_NATIVE_DRIVER = true;
export class PinchableView extends React.Component {
  _baseScale = new Animated.Value(1);
  _pinchScale = new Animated.Value(1);
  _scale = Animated.multiply(this._baseScale, this._pinchScale);
  _lastScale = 1;
  _onPinchGestureEvent = Animated.event(
    [{nativeEvent: {scale: this._pinchScale}}],
    {useNativeDriver: USE_NATIVE_DRIVER},
  );

  _onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this._lastScale *= event.nativeEvent.scale;
      this._baseScale.setValue(this._lastScale);
      this._pinchScale.setValue(1);
    }
  };

  render() {
    return (
      <PinchGestureHandler
        onGestureEvent={this._onPinchGestureEvent}
        onHandlerStateChange={this._onPinchHandlerStateChange}>
        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            transform: [{perspective: 200}, {scale: this._scale}],
          }}
          collapsable={false}>
          {this.props.children}
        </Animated.View>
      </PinchGestureHandler>
    );
  }
}

import React, {useState} from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import {MinUidConsumer} from '../../agora-rn-uikit/src/MinUidContext';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import {MaxVideoView} from '../../agora-rn-uikit/Components';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';

const PinnedVideo = () => {
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  let onLayout = () => {
    setTimeout(() => {
      let {height, width} = Dimensions.get('window');
      let isLandscape = width > height;
      setDim([width, height, isLandscape]);
    }, 20);
  };

  return (
    <View
      style={{flexDirection: dim[2] ? 'row' : 'column', flex: 1}}
      onLayout={onLayout}>
      <View style={dim[2] ? {width: '80%'} : {flex: 2}}>
        <MaxUidConsumer>
          {(maxUsers) => (
            <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
          )}
        </MaxUidConsumer>
      </View>
      <ScrollView
        horizontal={dim[2] ? false : true}
        decelerationRate={0}
        // snapToInterval={width / 2}
        // snapToAlignment={'center'}
        style={dim[2] ? {marginTop: dim[1] * 0.08, width: '20%'} : {flex: 1}}>
        <RtcContext.Consumer>
          {(data) => (
            <MinUidConsumer>
              {(minUsers) =>
                minUsers.map((user) => (
                  <TouchableOpacity
                    style={
                      dim[2]
                        ? {
                            width: '100%',
                            height: dim[0] * 0.1125 + 2, // width * 20/100 * 9/16 + 2
                            zIndex: 40,
                          }
                        : {
                            width: ((dim[1] / 3.6) * 16) / 9, //dim[1] /4.3, // width * 20/100 * 9/16 + 2
                            height: '100%',
                            zIndex: 40,
                          }
                    }
                    key={user.uid}
                    onPress={() => {
                      data.dispatch({type: 'SwapVideo', value: [user]});
                    }}>
                    <View style={{flex: 1}}>
                      <MaxVideoView
                        user={user}
                        key={user.uid}
                        showOverlay={false}
                      />
                    </View>
                  </TouchableOpacity>
                ))
              }
            </MinUidConsumer>
          )}
        </RtcContext.Consumer>
      </ScrollView>
    </View>
  );
};

export default PinnedVideo;

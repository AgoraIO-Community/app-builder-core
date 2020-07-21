import React from 'react';
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
import styles from './styles';

const {width} = Dimensions.get('window');

const PinnedVideo = () => {
  return (
    <ScrollView
      horizontal={true}
      decelerationRate={0}
      snapToInterval={width / 2}
      snapToAlignment={'center'}
      style={styles.full}>
      <RtcContext.Consumer>
        {(data) => (
          <MinUidConsumer>
            {(minUsers) =>
              minUsers.map((user) => (
                <TouchableOpacity
                  style={
                    Platform.OS === 'web'
                      ? styles.remoteViewTouchableWeb
                      : styles.remoteViewTouchable
                  }
                  key={user.uid}
                  onPress={() => {
                    data.dispatch({type: 'SwapVideo', value: [user]});
                  }}>
                  <View style={styles.pinnedVideo}>
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
  );
};

export default PinnedVideo;

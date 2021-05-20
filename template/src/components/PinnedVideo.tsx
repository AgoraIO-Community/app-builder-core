import React, {useState, useContext} from 'react';
import {
  ScrollView,
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
  Platform,
  Text,
  Image,
} from 'react-native';
import {MinUidConsumer} from '../../agora-rn-uikit/src/MinUidContext';
import RtcContext from '../../agora-rn-uikit/src/RtcContext';
import {MaxVideoView} from '../../agora-rn-uikit/Components';
import {MaxUidConsumer} from '../../agora-rn-uikit/src/MaxUidContext';
import chatContext from './ChatContext';
import ColorContext from './ColorContext';
import icons from '../assets/icons';
import {layoutProps} from '../../theme.json';

const {topPinned} = layoutProps;

const PinnedVideo = () => {
  const {primaryColor} = useContext(ColorContext);
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
  const isSidePinnedlayout = topPinned === true ? false : dim[2]; // if either explicity set to false or auto evaluation
  const {userList, localUid} = useContext(chatContext);
  return (
    <View
      style={{flexDirection: isSidePinnedlayout ? 'row' : 'column', flex: 1}}
      onLayout={onLayout}>
      <ScrollView
        horizontal={!isSidePinnedlayout}
        decelerationRate={0}
        // snapToInterval={
        //   dim[2] ? dim[0] * 0.1125 + 2 : ((dim[1] / 3.6) * 16) / 9
        // }
        // snapToAlignment={'center'}
        style={isSidePinnedlayout ? {width: '20%'} : {flex: 1}}>
        <RtcContext.Consumer>
          {(data) => (
            <MinUidConsumer>
              {(minUsers) =>
                minUsers.map((user) => (
                  <TouchableOpacity
                    style={
                      isSidePinnedlayout
                        ? {
                            width: '100%',
                            height: dim[0] * 0.1125 + 2, // width * 20/100 * 9/16 + 2
                            zIndex: 40,
                          }
                        : {
                            width: ((dim[1] / 3) * 16) / 9 / 2 + 12, //dim[1] /4.3
                            height: '100%',
                            zIndex: 40,
                            paddingHorizontal: 20,
                            paddingVertical: 5,
                          }
                    }
                    key={user.uid}
                    onPress={() => {
                      data.dispatch({type: 'SwapVideo', value: [user]});
                    }}>
                    <View style={style.flex1}>
                      <MaxVideoView
                        user={user}
                        key={user.uid}
                        showOverlay={false}
                      />
                      <View style={style.nameHolder}>
                        <View style={[style.MicBackdrop]}>
                          <Image
                            source={{
                              uri: user.audio ? icons.mic : icons.micOff,
                            }}
                            style={[
                              style.MicIcon,
                              {
                                tintColor: user.audio ? primaryColor : 'red',
                              },
                            ]}
                            resizeMode={'contain'}
                          />
                        </View>
                        <Text style={style.name}>
                          {user.uid === 'local'
                            ? userList[localUid]
                              ? userList[localUid].name + ' '
                              : 'You '
                            : userList[user.uid]
                            ? userList[user.uid].name + ' '
                            : 'User '}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              }
            </MinUidConsumer>
          )}
        </RtcContext.Consumer>
      </ScrollView>
      <View style={isSidePinnedlayout ? style.width80 : style.flex4}>
        <MaxUidConsumer>
          {(maxUsers) => (
            <View style={style.flex1}>
              <MaxVideoView user={maxUsers[0]} key={maxUsers[0].uid} />
              <View style={style.nameHolder}>
                <View style={[style.MicBackdrop]}>
                  <Image
                    source={{
                      uri: maxUsers[0].audio ? icons.mic : icons.micOff,
                    }}
                    style={[
                      style.MicIcon,
                      {
                        tintColor: maxUsers[0].audio ? primaryColor : 'red',
                      },
                    ]}
                    resizeMode={'contain'}
                  />
                </View>
                <Text style={style.name}>
                  {maxUsers[0].uid === 'local'
                    ? userList[localUid]
                      ? userList[localUid].name + ' '
                      : 'You '
                    : userList[maxUsers[0].uid]
                    ? userList[maxUsers[0].uid].name + ' '
                    : 'User '}
                </Text>
              </View>
            </View>
          )}
        </MaxUidConsumer>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  width80: {width: '80%'},
  flex2: {flex: 2},
  flex4: {flex: 4},
  flex1: {flex: 1},
  nameHolder: {
    marginTop: -25,
    backgroundColor: '#ffffffbb',
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    height: 25,
    borderTopLeftRadius: 15,
    flexDirection: 'row',
  },
  name: {color: '#333', lineHeight: 25, fontWeight: '700'},
  MicBackdrop: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginHorizontal: 10,
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
  },
  MicIcon: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
  },
});

export default PinnedVideo;

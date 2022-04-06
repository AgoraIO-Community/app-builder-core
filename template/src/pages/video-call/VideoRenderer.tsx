import React, {useContext} from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import {RtcContext, UidInterface} from '../../../agora-rn-uikit';
import ScreenShareNotice from '../../subComponents/ScreenShareNotice';
import {MaxVideoView} from '../../../agora-rn-uikit';
import FallbackLogo from '../../subComponents/FallbackLogo';
import ColorContext from '../../components/ColorContext';
import chatContext from '../../components/ChatContext';
import {RFValue} from 'react-native-responsive-fontsize';
import {ImageIcon} from '../../../agora-rn-uikit';
import TextWithTooltip from '../../subComponents/TextWithTooltip';
import networkQualityContext from '../../components/NetworkQualityContext';
import {NetworkQualityPill} from '../../subComponents/NetworkQualityPill';

interface MaxVideoRendererInterface {
  user: UidInterface;
  // ----------
  // incase of single component for min and max
  // with conditional rendering.
  isMax?: Boolean;
  // ----------
  index: number;
}
const MaxVideoRenderer: React.FC<MaxVideoRendererInterface> = ({
  user,
  isMax,
}) => {
  const {dispatch} = useContext(RtcContext);
  const {userList, localUid} = useContext(chatContext);
  const {primaryColor} = useContext(ColorContext);
  const networkQualityStat = useContext(networkQualityContext);

  return (
    <View style={maxStyle.container}>
      <ScreenShareNotice uid={user.uid} />
      <NetworkQualityPill
        networkStat={
          networkQualityStat[user.uid]
            ? networkQualityStat[user.uid]
            : user.audio || user.video
            ? 8
            : 7
        }
        primaryColor={primaryColor}
        rootStyle={{
          marginLeft: 25,
          top: 8,
          right: 10,
        }}
        small
      />
      <MaxVideoView
        fallback={() => {
          if (user.uid === 'local') {
            return FallbackLogo(userList[localUid]?.name);
          } else if (String(user.uid)[0] === '1') {
            return FallbackLogo('PSTN User');
          } else {
            return FallbackLogo(userList[user.uid]?.name);
          }
        }}
        user={user}
        key={user.uid}
      />
      <View style={maxStyle.nameHolder}>
        <View style={[maxStyle.MicBackdrop]}>
          <ImageIcon
            name={user.audio ? 'mic' : 'micOff'}
            color={user.audio ? primaryColor : 'red'}
            style={maxStyle.MicIcon}
          />
        </View>
        <View style={{flex: 1}}>
          <TextWithTooltip
            value={
              user.uid === 'local'
                ? userList[localUid]
                  ? userList[localUid].name + ' '
                  : 'You '
                : userList[user.uid]
                ? userList[user.uid].name + ' '
                : user.uid === 1
                ? userList[localUid].name + "'s screen "
                : 'User '
            }
            style={[
              maxStyle.name,
              {
                fontSize: 14,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const maxStyle = StyleSheet.create({
  container: {width: '100%', height: '100%'},
  width80: {width: '80%'},
  width100: {width: '100%'},
  flex2: {flex: 2},
  flex4: {flex: 4, backgroundColor: '#ffffff00'},
  flex1: {flex: 1},
  nameHolder: {
    marginTop: -25,
    backgroundColor: $config.SECONDARY_FONT_COLOR + 'aa',
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    height: 25,
    borderTopLeftRadius: 15,
    borderBottomRightRadius: 15,
    flexDirection: 'row',
    zIndex: 5,
    maxWidth: '100%',
  },
  name: {
    color: $config.PRIMARY_FONT_COLOR,
    lineHeight: 25,
    fontWeight: '700',
    flexShrink: 1,
  },
  MicBackdrop: {
    width: 20,
    height: 20,
    borderRadius: 15,
    marginHorizontal: 10,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    display: 'flex',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  MicIcon: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
    resizeMode: 'contain',
  },
});

const MinVideoRenderer = ({
  user,
  viewProps,
}: {
  user: UidInterface;
  min?: Boolean;
  viewProps: any;
  index: number;
}) => {
  const {dispatch} = useContext(RtcContext);
  const {userList, localUid} = useContext(chatContext);
  const {primaryColor} = useContext(ColorContext);
  const {isSidePinnedlayout, dim, height, width} = viewProps;
  const networkQualityStat = useContext(networkQualityContext);

  return (
    <Pressable
      style={
        isSidePinnedlayout
          ? {
              width: '100%',
              height: dim[0] * 0.1125 + 2, // width * 20/100 * 9/16 + 2
              zIndex: 40,
              paddingBottom: 8,
            }
          : {
              width: ((dim[1] / 3) * 16) / 9 / 2 + 12, //dim[1] /4.3
              height: '100%',
              zIndex: 40,
              paddingRight: 8,
              paddingVertical: 4,
            }
      }
      key={user.uid}
      onPress={() => {
        dispatch({type: 'SwapVideo', value: [user]});
      }}>
      <View style={minStyle.flex1}>
        <NetworkQualityPill
          networkStat={
            networkQualityStat[user.uid]
              ? networkQualityStat[user.uid]
              : user.audio || user.video
              ? 8
              : 7
          }
          primaryColor={primaryColor}
          rootStyle={{left: 5, top: 5}}
          small
        />
        <MaxVideoView
          fallback={() => {
            if (user.uid === 'local') {
              return FallbackLogo(userList[localUid]?.name);
            } else if (String(user.uid)[0] === '1') {
              return FallbackLogo('PSTN User');
            } else {
              return FallbackLogo(userList[user.uid]?.name);
            }
          }}
          user={user}
          key={user.uid}
        />
        <View style={minStyle.nameHolder}>
          <View style={[minStyle.MicBackdrop]}>
            <ImageIcon
              name={user.audio ? 'mic' : 'micOff'}
              color={user.audio ? primaryColor : 'red'}
              style={minStyle.MicIcon}
            />
          </View>
          <View style={{flex: 1}}>
            <TextWithTooltip
              value={
                user.uid === 'local'
                  ? userList[localUid]
                    ? userList[localUid].name + ' '
                    : 'You '
                  : userList[user.uid]
                  ? userList[user.uid].name + ' '
                  : user.uid === 1
                  ? userList[localUid]?.name + "'s screen "
                  : String(user.uid)[0] === '1'
                  ? 'PSTN User '
                  : 'User '
              }
              style={[
                minStyle.name,
                {
                  fontSize: RFValue(14, height > width ? height : width),
                },
              ]}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const minStyle = StyleSheet.create({
  width80: {width: '80%'},
  width100: {width: '100%'},
  flex2: {flex: 2},
  flex4: {flex: 4, backgroundColor: '#ffffff00'},
  flex1: {flex: 1},
  nameHolder: {
    marginTop: -25,
    backgroundColor: $config.SECONDARY_FONT_COLOR + 'aa',
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    height: 25,
    borderTopLeftRadius: 15,
    borderBottomRightRadius: 15,
    flexDirection: 'row',
    zIndex: 5,
    maxWidth: '100%',
  },
  name: {
    color: $config.PRIMARY_FONT_COLOR,
    lineHeight: 25,
    fontWeight: '700',
    flexShrink: 1,
  },
  MicBackdrop: {
    width: 20,
    height: 20,
    borderRadius: 15,
    marginHorizontal: 10,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    display: 'flex',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  MicIcon: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
    resizeMode: 'contain',
  },
});

export {MinVideoRenderer, MaxVideoRenderer};
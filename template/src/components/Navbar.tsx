/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React, {useContext, useState} from 'react';
import {View, Text, Platform, StyleSheet, Dimensions} from 'react-native';
import icons from '../assets/icons';
import Settings from './Settings';
import CopyJoinInfo from '../subComponents/CopyJoinInfo';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {navHolder} from '../../theme.json';
import Layout from '../subComponents/LayoutEnum';
import ChatContext from '../components/ChatContext';
import mobileAndTabletCheck from '../utils/mobileWebTest';
import {BtnTemplate} from '../../agora-rn-uikit';
import {ImageIcon} from '../../agora-rn-uikit';
import LiveStreamContext from './livestream';
import {numFormatter} from '../utils/index';

const Navbar = (props: any) => {
  const {messageStore, onlineUsersCount} = useContext(ChatContext);
  const {isPendingRequestToReview, setLastCheckedRequestTimestamp} =
    useContext(LiveStreamContext);

  const {
    recordingActive,
    sidePanel,
    setSidePanel,
    layout,
    setLayout,
    pendingMessageLength,
    setLastCheckedPublicState,
    isHost,
    title,
  } = props;
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const isDesktop = dim[0] > 1224;

  const renderSeparator = () => {
    return Platform.OS === 'web' && isDesktop ? (
      <View style={style.navItem}>
        <View style={style.navItemSeparator}></View>
      </View>
    ) : (
      <View style={{marginHorizontal: 2}}></View>
    );
  };

  const renderBadge = (badgeCount: any) => {
    return (
      <View
        style={{
          position: 'absolute',
          top: Platform.OS === 'web' ? -10 : 2,
        }}>
        <View style={style.badge}>
          <Text
            style={{
              color: $config.SECONDARY_FONT_COLOR,
              fontSize: 12,
            }}>
            {numFormatter(badgeCount)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        Platform.OS === 'web' ? style.navHolder : style.navHolderNative,
        {backgroundColor: $config.SECONDARY_FONT_COLOR + 80},
        Platform.OS === 'web'
          ? {
              justifyContent: mobileAndTabletCheck()
                ? 'space-between'
                : 'flex-end',
            }
          : {},
      ]}>
      {recordingActive && !mobileAndTabletCheck() ? (
        <View
          style={[
            style.recordingView,
            {backgroundColor: $config.SECONDARY_FONT_COLOR},
          ]}>
          <ImageIcon
            name={'recordingActiveIcon'}
            style={{
              width: 20,
              height: 20,
              margin: 1,
            }}
            color="#FD0845"
          />
          <Text
            style={{
              fontSize: Platform.OS === 'web' ? 16 : 12,
              color: '#FD0845',
              fontWeight: '400',
              alignSelf: 'center',
              textAlign: 'center',
              flex: 1,
            }}>
            Recording
          </Text>
        </View>
      ) : (
        <></>
      )}
      <View
        style={[
          style.roomNameContainer,
          Platform.OS === 'web' && !mobileAndTabletCheck()
            ? {transform: [{translateX: '50%'}]}
            : {},
        ]}>
        {Platform.OS === 'web' ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              paddingLeft: 5,
            }}>
            <View>
              <Text style={style.roomNameText}>
                {mobileAndTabletCheck()
                  ? title.length > 13
                    ? title.slice(0, 13) + '..'
                    : title
                  : title}
              </Text>
            </View>
            <View />
            <View
              style={{
                backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
                width: 1,
                height: 'auto',
                marginHorizontal: 10,
              }}
            />
            <View style={{width: 30}}>
              <CopyJoinInfo />
            </View>
          </View>
        ) : (
          <View>
            <Text style={style.roomNameText}>{title}</Text>
          </View>
        )}
      </View>
      <View style={style.navControlBar}>
        <View
          style={[
            style.navContainer,
            {
              minWidth:
                Platform.OS === 'web' && isDesktop
                  ? 300
                  : mobileAndTabletCheck()
                  ? 160
                  : 200,
            },
          ]}>
          {onlineUsersCount !== 0 && (
            <View style={[style.navItem, {justifyContent: 'center'}]}>
              <View style={style.chip}>
                {onlineUsersCount > 0 && (
                  <Text style={style.chipText}>
                    {numFormatter(onlineUsersCount)}
                  </Text>
                )}
              </View>
            </View>
          )}
          <View style={[style.navItem, style.navSmItem]}>
            <BtnTemplate
              onPress={() => {
                sidePanel === SidePanelType.Participants
                  ? setSidePanel(SidePanelType.None)
                  : setSidePanel(SidePanelType.Participants);
                $config.EVENT_MODE && $config.RAISE_HAND;
                setLastCheckedRequestTimestamp(new Date().getTime());
              }}
              style={style.btnHolder}
              name={
                sidePanel === SidePanelType.Participants
                  ? 'participantFilledIcon'
                  : 'participantIcon'
              }
            />
            {$config.EVENT_MODE &&
              $config.RAISE_HAND &&
              isPendingRequestToReview && (
                <View
                  style={{
                    position: 'absolute',
                    top: Platform.OS === 'web' ? -10 : 2,
                  }}>
                  <View style={[style.badge, {paddingHorizontal: 3}]}>
                    <ImageIcon
                      icon={icons['exclamationIcon']}
                      color={$config.SECONDARY_FONT_COLOR}
                    />
                  </View>
                </View>
              )}
          </View>
          {$config.CHAT && (
            <>
              {renderSeparator()}
              <View style={[style.navItem, style.navSmItem]}>
                <BtnTemplate
                  style={style.btnHolder}
                  onPress={() => {
                    setLastCheckedPublicState(messageStore.length);
                    sidePanel === SidePanelType.Chat
                      ? setSidePanel(SidePanelType.None)
                      : setSidePanel(SidePanelType.Chat);
                  }}
                  name={
                    sidePanel === SidePanelType.Chat
                      ? 'chatIconFilled'
                      : 'chatIcon'
                  }
                />
                {sidePanel !== SidePanelType.Chat &&
                  pendingMessageLength !== 0 &&
                  renderBadge(pendingMessageLength)}
              </View>
            </>
          )}
          {renderSeparator()}
          <View style={[style.navItem, style.navSmItem]}>
            <BtnTemplate
              style={style.btnHolder}
              onPress={() => {
                setLayout((l: Layout) =>
                  l === Layout.Pinned ? Layout.Grid : Layout.Pinned,
                );
              }}
              name={layout ? 'pinnedLayoutIcon' : 'gridLayoutIcon'}
            />
          </View>
          {/** Show setting icon only in non native apps
           * show in web/electron/mobile web
           * hide in android/ios  */}
          {Platform.OS !== 'android' && Platform.OS !== 'ios' && (
            <>
              {renderSeparator()}
              <View style={[style.navItem, style.navSmItem]}>
                <Settings
                  sidePanel={sidePanel}
                  setSidePanel={setSidePanel}
                  isHost={isHost}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};
const style = StyleSheet.create({
  navHolder: navHolder,
  navHolderNative: {
    position: 'relative',
    width: '100%',
    height: '8%',
    backgroundColor: $config.SECONDARY_FONT_COLOR + '80',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  recordingView: {
    height: 35,
    maxHeight: 30,
    position: 'absolute',
    left: 10,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  recordingIcon: {
    width: 20,
    height: 20,
    margin: 1,
    resizeMode: 'contain',
  },
  btnHolder: {
    marginHorizontal: mobileAndTabletCheck() ? 2 : 0,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  roomNameContainer: {
    paddingHorizontal: 1,
    marginHorizontal: 1,
    height: 35,
    maxHeight: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 10,
  },
  roomNameText: {
    fontSize: 18,
    color: $config.PRIMARY_FONT_COLOR,
    fontWeight: '500',
  },
  badge: {
    lineHeight: 1,
    height: 20,
    minWidth: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: $config.PRIMARY_COLOR,
    color: $config.SECONDARY_FONT_COLOR,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
    borderRadius: 10,
    position: 'absolute',
    paddingHorizontal: 5,
    top: 0,
    left: -2,
  },
  chip: {
    backgroundColor: $config.PRIMARY_COLOR,
    borderRadius: 2.5,
    paddingHorizontal: 5,
    marginHorizontal: 5,
    paddingVertical: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
    fontSize: 12,
    color: $config.SECONDARY_FONT_COLOR,
  },
  navControlBar: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 9,
  },
  navContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor:
      Platform.OS === 'web'
        ? $config.SECONDARY_FONT_COLOR
        : $config.SECONDARY_FONT_COLOR + '00',
    paddingVertical: 4,
    paddingHorizontal: mobileAndTabletCheck() ? 0 : 10,
    minHeight: 35,
    borderRadius: 10,
  },
  navItem: {
    height: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  navSmItem: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '15%',
  },
  navItemSeparator: {
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    width: 1,
    height: '100%',
    marginHorizontal: 10,
    alignSelf: 'center',
    opacity: 0.8,
  },
});

export default Navbar;

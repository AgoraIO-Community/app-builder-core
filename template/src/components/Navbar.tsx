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
import React, {useContext, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import icons from '../assets/icons';
import Settings from './Settings';
import CopyJoinInfo from '../subComponents/CopyJoinInfo';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import {navHolder} from '../../theme.json';
import ChatContext from '../components/ChatContext';
import isMobileOrTablet from '../utils/isMobileOrTablet';
import {BtnTemplate} from '../../agora-rn-uikit';
import {ImageIcon} from '../../agora-rn-uikit';
import LiveStreamContext from './livestream';
import {numFormatter} from '../utils/index';
import {useVideoCall} from '../pages/video-call/useVideoCall';
import {useChatUIData} from '../components/useChatUI';
import useCustomLayout from '../pages/video-call/CustomLayout';
import {isAndroid, isIOS, isWeb} from '../utils/common';
import {useChangeDefaultLayout} from '../pages/video-call/DefaultLayouts';
import {useRecording} from '../subComponents/recording/useRecording';

const Navbar = () => {
  const {messageStore, onlineUsersCount} = useContext(ChatContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    left: number;
    top: number;
  }>({left: 0, top: 0});
  const dropdownRef = useRef(null);
  const {isPendingRequestToReview, setLastCheckedRequestTimestamp} =
    useContext(LiveStreamContext);
  const layouts = useCustomLayout();
  const {
    sidePanel,
    setSidePanel,
    activeLayoutName,
    setActiveLayoutName,
    isHost,
    title,
  } = useVideoCall((data) => data);
  const {recordingActive} = useRecording((data) => data);
  const changeLayout = useChangeDefaultLayout();
  const layout = layouts.findIndex((item) => item.name === activeLayoutName);
  const {pendingMessageLength, setLastCheckedPublicState} = useChatUIData(
    (data) => data,
  );
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
    return isWeb && isDesktop ? (
      <View style={style.navItem}>
        <View style={style.navItemSeparator}></View>
      </View>
    ) : (
      <View style={{marginHorizontal: 2}}></View>
    );
  };

  // used for icon dropdown - custom layout
  const renderSeparatorHorizontal = () => {
    return isWeb && isDesktop ? (
      <View style={style.navItem}>
        <View style={style.navItemSeparatorHorizontal}></View>
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
          top: isWeb ? -10 : 2,
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

  const renderDropdown = () => {
    const layoutToDisplay =
      layouts && Array.isArray(layouts) && layouts.length
        ? layouts.filter((item) => item.name !== activeLayoutName)
        : [];
    /**
     * By default 0th layout icon will be dislayed in the UI.
     * so filering the active layout from the layouts list
     * and creating the dropdown with remaining data
     */
    const data = layoutToDisplay.map((item, index) => {
      let content = [];
      content.push(
        item?.iconName ? (
          <View
            style={style.dropdownIconContainer}
            key={'navLayoutIcon' + index}>
            <BtnTemplate
              style={style.btnHolderCustom}
              onPress={() => {
                setActiveLayoutName(item.name);
                setShowDropdown(false);
              }}
              name={item?.iconName}
            />
          </View>
        ) : (
          <View
            style={style.dropdownIconContainer}
            key={'navLayoutIcon' + index}>
            <BtnTemplate
              style={style.btnHolderCustom}
              onPress={() => {
                setActiveLayoutName(item.name);
                setShowDropdown(false);
              }}
              icon={item.icon}
            />
          </View>
        ),
      );
      if (layoutToDisplay.length - 1 !== index) {
        content.push(
          <View
            style={style.separaterContainer}
            key={'navLayoutIconSeparater' + index}>
            {renderSeparatorHorizontal()}
          </View>,
        );
      }
      return content;
    });
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDropdown}
        onRequestClose={() => {
          setShowDropdown(false);
        }}>
        <TouchableWithoutFeedback
          onPress={() => {
            setShowDropdown(false);
          }}>
          <View style={style.backDrop} />
        </TouchableWithoutFeedback>
        <View
          style={[
            style.dropdownContainer,
            {
              top: dropdownPosition.top,
              left: dropdownPosition.left - (isWeb && isDesktop ? 0 : 6),
            },
          ]}>
          {data}
        </View>
      </Modal>
    );
  };
  const renderLayoutIcon = (showDropdown?: boolean) => {
    let onPress = () => {};
    let renderContent = [];
    if (!showDropdown) {
      onPress = () => {
        changeLayout();
      };
    } else {
      onPress = () => {
        dropdownRef?.current?.measure(
          (
            fx: number,
            fy: number,
            localWidth: number,
            localHeight: number,
            px: number,
            py: number,
          ) => {
            if (py && px && localHeight) {
              setDropdownPosition({
                top: py + localHeight,
                left: px,
              });
            }
          },
        );
        setShowDropdown(true);
      };
    }
    renderContent.push(
      layouts[layout]?.iconName ? (
        <BtnTemplate
          key={'defaultLayoutIconWithName'}
          style={style.btnHolder}
          onPress={onPress}
          name={layouts[layout]?.iconName}
        />
      ) : (
        <BtnTemplate
          key={'defaultLayoutIconWithIcon'}
          style={style.btnHolder}
          onPress={onPress}
          icon={layouts[layout]?.icon}
        />
      ),
    );
    return renderContent;
  };

  return (
    <View
      onLayout={onLayout}
      style={[
        isWeb ? style.navHolder : style.navHolderNative,
        {backgroundColor: $config.SECONDARY_FONT_COLOR + 80},
        isWeb
          ? {
              justifyContent: isMobileOrTablet() ? 'space-between' : 'flex-end',
            }
          : {},
      ]}>
      {recordingActive && !isMobileOrTablet() ? (
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
              fontSize: isWeb ? 16 : 12,
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
          isWeb && !isMobileOrTablet()
            ? {transform: [{translateX: '50%'}]}
            : {},
        ]}>
        {isWeb ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              paddingLeft: 5,
            }}>
            <View>
              <Text style={style.roomNameText}>
                {isMobileOrTablet()
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
                isWeb && isDesktop ? 300 : isMobileOrTablet() ? 160 : 200,
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
                    top: isWeb ? -10 : 2,
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
          <View
            style={[style.navItem, style.navSmItem]}
            ref={dropdownRef}
            /**
             * .measure returns undefined on Android unless collapsable=false or onLayout are specified
             * so added collapsable property
             * https://github.com/facebook/react-native/issues/29712
             * */
            collapsable={false}>
            {/**
             * Based on the flag. it will render the dropdown
             */}
            {showDropdown ? renderDropdown() : <></>}
            {/**
             * If layout contains more than 2 data. it will render the dropdown.
             */}
            {layouts && Array.isArray(layouts) && layouts.length > 2
              ? renderLayoutIcon(true)
              : renderLayoutIcon(false)}
          </View>
          {/** Show setting icon only in non native apps
           * show in web/electron/mobile web
           * hide in android/ios  */}
          {!isAndroid && !isIOS && (
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
  backDrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
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
    marginHorizontal: isMobileOrTablet() ? 2 : 0,
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  btnHolderCustom: {
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
    fontFamily: isIOS ? 'Helvetica' : 'sans-serif',
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
    fontFamily: isIOS ? 'Helvetica' : 'sans-serif',
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
    backgroundColor: isWeb
      ? $config.SECONDARY_FONT_COLOR
      : $config.SECONDARY_FONT_COLOR + '00',
    paddingVertical: 4,
    paddingHorizontal: isMobileOrTablet() ? 0 : 10,
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
  navItemSeparatorHorizontal: {
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    width: '100%',
    height: 1,
    marginVertical: 10,
    alignSelf: 'center',
    opacity: 0.8,
  },
  dropdownIconContainer: {
    flex: 1,
    paddingHorizontal: 5,
  },
  separaterContainer: {
    flex: 0.5,
    paddingHorizontal: 5,
  },
  dropdownContainer: {
    position: 'absolute',
    marginTop: 5,
    width: 40,
    height: 90,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
  },
});

export default Navbar;

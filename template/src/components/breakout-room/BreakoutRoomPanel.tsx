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
import React, {useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {isMobileUA, isWebInternal, useIsSmall} from '../../utils/common';
import CommonStyles from '../CommonStyles';
import {getGridLayoutName} from '../../pages/video-call/DefaultLayouts';
import {BreakoutRoomHeader} from '../../pages/video-call/SidePanelHeader';
import useCaptionWidth from '../../subComponents/caption/useCaptionWidth';
import {useRoomInfo} from '../room-info/useRoomInfo';
import {useBreakoutRoom} from './context/BreakoutRoomContext';
import BreakoutRoomSettings from './ui/BreakoutRoomSettings';
import BreakoutRoomGroupSettings from './ui/BreakoutRoomGroupSettings';
import ThemeConfig from '../../theme';
import TertiaryButton from '../../atoms/TertiaryButton';
import Spacer from '../../atoms/Spacer';
import {useLayout} from '../../utils/useLayout';

const BreakoutRoomPanel = props => {
  const {showHeader = true} = props;
  const isSmall = useIsSmall();
  const {currentLayout} = useLayout();
  const {transcriptHeight} = useCaptionWidth();
  const {
    data: {isHost},
  } = useRoomInfo();

  const {
    checkBreakoutRoomSession,
    createBreakoutRoomGroup,
    breakoutGroups,
    startBreakoutRoom,
  } = useBreakoutRoom();

  useEffect(() => {
    const init = async () => {
      try {
        checkBreakoutRoomSession();
      } catch (error) {
        console.error('Failed to check breakout session:', error);
      }
    };
    init();
  }, []);

  return (
    <View
      testID="videocall-breakout-room"
      style={[
        isMobileUA()
          ? //mobile and mobile web
            CommonStyles.sidePanelContainerNative
          : isSmall()
          ? // desktop minimized
            CommonStyles.sidePanelContainerWebMinimzed
          : // desktop maximized
            CommonStyles.sidePanelContainerWeb,
        isWebInternal() && !isSmall() && currentLayout === getGridLayoutName()
          ? {marginTop: 4}
          : {},
        //@ts-ignore
        transcriptHeight && !isMobileUA() && {height: transcriptHeight},
      ]}>
      {showHeader && <BreakoutRoomHeader />}
      <ScrollView style={[style.pannelOuterBody]}>
        <View style={style.panelInnerBody}>
          <BreakoutRoomSettings />
          <BreakoutRoomGroupSettings groups={breakoutGroups} />
          <TertiaryButton
            containerStyle={style.createBtnContainer}
            textStyle={style.createBtnText}
            text={'+ Create New Room'}
            onPress={() => createBreakoutRoomGroup()}
          />
        </View>
      </ScrollView>
      {isHost && (
        <View style={style.footer}>
          <View style={{display: 'flex', flex: 1}}>
            <TertiaryButton onPress={() => {}} text={'CANCEL'} />
          </View>
          <Spacer size={16} horizontal />
          <View style={{display: 'flex', flex: 1}}>
            <TertiaryButton
              containerStyle={{
                backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
                borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
              }}
              onPress={() => {
                startBreakoutRoom();
              }}
              text={'START'}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  footer: {
    width: '100%',
    padding: 12,
    height: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: $config.CARD_LAYER_2_COLOR,
  },
  pannelOuterBody: {
    display: 'flex',
    flex: 1,
  },
  panelInnerBody: {
    display: 'flex',
    flex: 1,
    padding: 12,
    gap: 12,
  },
  createBtnContainer: {
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderRadius: 8,
  },
  createBtnText: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    lineHeight: 20,
    fontWeight: '500',
    fontSize: ThemeConfig.FontSize.normal,
  },
});

export default BreakoutRoomPanel;

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
import {View, StyleSheet, ScrollView} from 'react-native';
import ParticipantSectionTitle from './participants/ParticipantSectionTitle';
import AllHostParticipants from './participants/AllHostParticipants';
import {useString} from '../utils/useString';
import {isMobileUA, isWebInternal, useIsSmall} from '../utils/common';
import ChatContext from './ChatContext';
import CommonStyles from './CommonStyles';
import {useLayout, useContent} from 'customization-api';
import {getGridLayoutName} from '../pages/video-call/DefaultLayouts';
import {BreakoutRoomHeader} from '../pages/video-call/SidePanelHeader';
import useCaptionWidth from '../../src/subComponents/caption/useCaptionWidth';
import {
  peoplePanelInThisMeetingLabel,
  peoplePanelNoUsersJoinedContent,
} from '../../src/language/default-labels/videoCallScreenLabels';

const BreakoutRoomView = props => {
  const {activeUids, customContent} = useContent();
  const {onlineUsersCount} = useContext(ChatContext);
  const {showHeader = true} = props;
  const meetingParticpantsLabel = useString(peoplePanelInThisMeetingLabel)();
  const noUsersJoinedYet = useString(peoplePanelNoUsersJoinedContent)();
  const isSmall = useIsSmall();
  const [showMeetingParticipants, setShowMeetingParticipants] = useState(true);
  const {currentLayout} = useLayout();
  const {transcriptHeight} = useCaptionWidth();

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
      <ScrollView style={[style.bodyContainer]}>
        <>
          <ParticipantSectionTitle
            title={meetingParticpantsLabel}
            count={onlineUsersCount}
            isOpen={showMeetingParticipants}
            onPress={() => setShowMeetingParticipants(!showMeetingParticipants)}
          />
          {showMeetingParticipants ? (
            <AllHostParticipants
              emptyMessage={noUsersJoinedYet}
              //custom content shouldn't be shown in the participant list. so filtering the activeuids
              uids={activeUids.filter(i => !customContent[i])}
              isMobile={isSmall()}
              updateActionSheet={props.updateActionSheet}
              handleClose={props.handleClose}
            />
          ) : (
            <></>
          )}
        </>
      </ScrollView>
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
  bodyContainer: {
    flex: 1,
  },
});

export default BreakoutRoomView;

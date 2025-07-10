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
import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import ParticipantSectionTitle from '../participants/ParticipantSectionTitle';
import AllHostParticipants from '../participants/AllHostParticipants';
import {useString} from '../../utils/useString';
import {isMobileUA, isWebInternal, useIsSmall} from '../../utils/common';
import ChatContext from '../ChatContext';
import CommonStyles from '../CommonStyles';
import {useLayout, useContent, TertiaryButton, Spacer} from 'customization-api';
import {getGridLayoutName} from '../../pages/video-call/DefaultLayouts';
import {BreakoutRoomHeader} from '../../pages/video-call/SidePanelHeader';
import useCaptionWidth from '../../subComponents/caption/useCaptionWidth';
import {
  peoplePanelInThisMeetingLabel,
  peoplePanelNoUsersJoinedContent,
} from '../../language/default-labels/videoCallScreenLabels';
import {useRoomInfo} from '../room-info/useRoomInfo';
import {useBreakoutRoom} from './context/BreakoutRoomContext';

const BreakoutRoomGroupCard = ({name, participants}) => {
  const {defaultContent} = useContent();
  return (
    <View
      key={name}
      style={{
        margin: 12,
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 12,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: $config.CARD_LAYER_3_COLOR,
          backgroundColor: $config.CARD_LAYER_1_COLOR,
        }}>
        <View
          style={{
            height: 24,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text style={{color: $config.FONT_COLOR}}>{name}</Text>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignSelf: 'stretch',
            alignItems: 'flex-start',
          }}>
          {participants?.hosts?.length ? (
            <>
              <Text
                style={{
                  color: $config.FONT_COLOR,
                  fontSize: 16,
                  fontWeight: '800',
                }}>
                Hosts
              </Text>
              {participants?.hosts?.map(uid => {
                return (
                  <Text style={{color: $config.FONT_COLOR}}>
                    {defaultContent[uid].name}
                  </Text>
                );
              })}
            </>
          ) : (
            <></>
          )}
          <Spacer size={8} horizontal />
          {participants?.attendees?.length ? (
            <>
              <Text
                style={{
                  color: $config.FONT_COLOR,
                  fontSize: 16,
                  fontWeight: '800',
                }}>
                Attendees
              </Text>
              {participants?.attendees?.map(uid => {
                return (
                  <Text style={{color: $config.FONT_COLOR}}>
                    {defaultContent[uid]?.name}
                  </Text>
                );
              })}
            </>
          ) : (
            <></>
          )}
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignSelf: 'flex-end',
            backgroundColor: $config.CARD_LAYER_2_COLOR,
            padding: 10,
            borderRadius: 8,
          }}>
          <Text style={{color: $config.FONT_COLOR}}>
            Members{' - '}
            {participants?.hosts?.length || 0 + participants?.attendees?.length}
          </Text>
        </View>
      </View>
    </View>
  );
};

const BreakoutRoomPanel = props => {
  const {activeUids, customContent} = useContent();
  const {onlineUsersCount} = useContext(ChatContext);
  const {showHeader = true} = props;
  const meetingParticpantsLabel = useString(peoplePanelInThisMeetingLabel)();
  const noUsersJoinedYet = useString(peoplePanelNoUsersJoinedContent)();
  const isSmall = useIsSmall();
  const [showMeetingParticipants, setShowMeetingParticipants] = useState(true);
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
              hideControls={true}
              showBreakoutRoomMenu={true}
              from="breakout-room"
            />
          ) : (
            <></>
          )}
        </>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignSelf: 'flex-end',
            margin: 10,
          }}>
          <TouchableOpacity onPress={() => createBreakoutRoomGroup()}>
            <Text style={{color: $config.PRIMARY_ACTION_BRAND_COLOR}}>
              + Create Group
            </Text>
          </TouchableOpacity>
        </View>
        {breakoutGroups.map((props, index) => {
          return <BreakoutRoomGroupCard key={index} {...props} />;
        })}
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
  bodyContainer: {
    flex: 1,
  },
});

export default BreakoutRoomPanel;

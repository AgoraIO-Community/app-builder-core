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
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {PropsContext, ClientRole} from '../../agora-rn-uikit';
import CopyJoinInfo from '../subComponents/CopyJoinInfo';
import ParticipantSectionTitle from './participants/ParticipantSectionTitle';
import AllHostParticipants from './participants/AllHostParticipants';
import AllAudienceParticipants from './participants/AllAudienceParticipants';
import CurrentLiveStreamRequestsView from '../subComponents/livestream/CurrentLiveStreamRequestsView';
import {useString} from '../utils/useString';
import {isWebInternal} from '../utils/common';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import {useLiveStreamDataContext} from './contexts/LiveStreamDataContext';
import {numFormatter} from '../utils';
import ChatContext from './ChatContext';
import {BtnTemplate} from '../../agora-rn-uikit';
import {useSidePanel} from '../utils/useSidePanel';
import {SidePanelType} from '../subComponents/SidePanelEnum';
import TertiaryButton from '../atoms/TertiaryButton';
import HostControlView from './HostControlView';
import {ButtonTemplateName} from '../utils/useButtonTemplate';
import Spacer from '../atoms/Spacer';

const ParticipantView = () => {
  const {liveStreamData, audienceUids, hostUids} = useLiveStreamDataContext();
  const {onlineUsersCount} = useContext(ChatContext);
  const {sidePanel, setSidePanel} = useSidePanel();
  const {rtcProps} = useContext(PropsContext);
  //commented for v1 release
  // const hostLabel = useString('hostLabel')();
  // const audienceLabel = useString('audienceLabel')();
  // const participantsLabel = useString('participantsLabel')();
  const hostLabel = 'Host';
  const audienceLabel = 'Audience';
  const participantsLabel = `Participants (${numFormatter(onlineUsersCount)})`;
  const {
    data: {isHost},
  } = useMeetingInfo();
  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isSmall = dim[0] < 700;
  return (
    <View
      testID="videocall-participants"
      style={
        isWebInternal()
          ? isSmall
            ? style.participantViewNative
            : style.participantView
          : style.participantViewNative
      }>
      <View style={style.header}>
        <Text style={style.mainHeading}>{participantsLabel}</Text>
        <BtnTemplate
          styleIcon={style.closeIcon}
          name={'closeRounded'}
          onPress={() => {
            setSidePanel(SidePanelType.None);
            props.handleClose && props.handleClose();
          }}
        />
      </View>
      <ScrollView style={[style.bodyContainer]}>
        {$config.EVENT_MODE ? (
          <>
            {
              /*Live streaming is true            
                Host and New host view */
              rtcProps?.role == ClientRole.Broadcaster &&
                (isHost ? (
                  /**
                   * Original Host
                   * a) Can view streaming requests
                   * b) Can view all hosts with remote controls
                   */
                  <>
                    {/* a) Live streaming view */}
                    <CurrentLiveStreamRequestsView userList={liveStreamData} />
                    {/* b) Host view with remote controls*/}
                    <ParticipantSectionTitle
                      title={hostLabel}
                      count={hostUids.length}
                    />
                    <AllHostParticipants />
                  </>
                ) : (
                  /** New Host ( earlier was 'audience' and now is host )
                   *  a) Can view all hosts without remote controls
                   */
                  <>
                    <ParticipantSectionTitle
                      title={hostLabel}
                      count={hostUids.length}
                    />
                    <AllAudienceParticipants uids={hostUids} />
                  </>
                ))
            }
            {
              /**
               *  Audience views all hosts without remote controls
               */
              rtcProps?.role == ClientRole.Audience && (
                <>
                  <ParticipantSectionTitle
                    title={hostLabel}
                    count={hostUids.length}
                  />
                  <AllAudienceParticipants uids={hostUids} />
                </>
              )
            }
            {
              /* Everyone can see audience */
              <>
                <ParticipantSectionTitle
                  title={audienceLabel}
                  count={audienceUids.length}
                />
                <AllAudienceParticipants uids={audienceUids} />
              </>
            }
          </>
        ) : (
          <AllHostParticipants />
        )}
      </ScrollView>

      <View style={style.footer}>
        <CopyJoinInfo hideLabel />
        {isHost && (
          <>
            <Spacer horizontal size={8} />
            <HostControlView />
          </>
        )}
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  participantView: {
    maxWidth: '20%',
    minWidth: 338,
    borderRadius: 12,
    marginLeft: 20,
    marginTop: 10,
    flex: 1,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 12,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  footer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F2',
  },

  participantViewNative: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
    right: 0,
    top: 0,
    borderBottomWidth: 1,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
  },
  bodyContainer: {
    flex: 1,
  },
  mainHeading: {
    fontSize: 16,
    letterSpacing: 0.8,
    lineHeight: 16,
    fontFamily: 'Source Sans Pro',
    fontWeight: '600',
    color: $config.PRIMARY_FONT_COLOR,
    alignSelf: 'center',
  },
});

export default ParticipantView;

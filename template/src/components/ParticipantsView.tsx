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
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import {PropsContext, ClientRole} from '../../agora-rn-uikit';
import CopyJoinInfo from '../subComponents/CopyJoinInfo';
import chatContext from './ChatContext';
import ParticipantSectionTitle from './participants/ParticipantSectionTitle';
import AllHostParticipants from './participants/AllHostParticipants';
import AllAudienceParticipants from './participants/AllAudienceParticipants';
import CurrentLiveStreamRequestsView from '../subComponents/livestream/CurrentLiveStreamRequestsView';
import {
  ParticipantContextProvider,
  ParticipantContextConsumer,
} from './participants/context/ParticipantContext';

const ParticipantView = (props: any) => {
  const {userList} = useContext(chatContext);
  const {rtcProps} = useContext(PropsContext);

  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isSmall = dim[0] < 700;
  let fontSize = Platform.OS === 'web' ? 14 : 16;
  return (
    <View
      style={
        Platform.OS === 'web'
          ? isSmall
            ? style.participantViewNative
            : style.participantView
          : style.participantViewNative
      }>
      <View style={[style.padding10]}>
        <View style={style.lineUnderHeading}>
          <Text style={style.mainHeading}>Participants</Text>
        </View>
      </View>
      <ScrollView style={[style.bodyContainer, style.padding10]}>
        {$config.EVENT_MODE ? (
          // Live streaming is true
          <ParticipantContextProvider>
            {/* Host and New host view */}
            {rtcProps?.role == ClientRole.Broadcaster &&
              (props.isHost ? (
                /**
                 * Original Host
                 * a) Can view streaming requests
                 * b) Can view all hosts with remote controls
                 */
                <>
                  {/* a) Live streaming view */}
                  <View style={style.participantsection}>
                    <CurrentLiveStreamRequestsView
                      p_style={style}
                      userList={userList}
                    />
                  </View>
                  {/* b) Host view with remote controls*/}
                  <ParticipantContextConsumer>
                    {({hostCount}) => {
                      return (
                        <View style={style.participantsection}>
                          <ParticipantSectionTitle
                            title="Host"
                            count={hostCount}
                          />
                          <View style={style.participantContainer}>
                            <AllHostParticipants
                              p_style={style}
                              isHost={props.isHost}
                            />
                          </View>
                        </View>
                      );
                    }}
                  </ParticipantContextConsumer>
                </>
              ) : (
                /** New Host ( earlier was 'audience' and now is host )
                 *  a) Can view all hosts without remote controls
                 */
                <ParticipantContextConsumer>
                  {({hostList, hostCount}) => {
                    return (
                      <View style={style.participantsection}>
                        <ParticipantSectionTitle
                          title="Host"
                          count={hostCount}
                        />
                        <AllAudienceParticipants
                          p_style={style}
                          participantList={hostList}
                          isHost={props.isHost}
                        />
                      </View>
                    );
                  }}
                </ParticipantContextConsumer>
              ))}
            {/**
             *  Audience views all hosts without remote controls
             */}
            {rtcProps?.role == ClientRole.Audience && (
              <ParticipantContextConsumer>
                {({hostList, hostCount}) => {
                  return (
                    <View style={style.participantsection}>
                      <ParticipantSectionTitle title="Host" count={hostCount} />
                      <AllAudienceParticipants
                        participantList={hostList}
                        p_style={style}
                        isHost={props.isHost}
                      />
                    </View>
                  );
                }}
              </ParticipantContextConsumer>
            )}
            {/* Everyone can see audience */}
            <ParticipantContextConsumer>
              {({audienceList, audienceCount}) => {
                return (
                  <View style={style.participantsection}>
                    <ParticipantSectionTitle
                      title="Audience"
                      count={audienceCount}
                    />
                    <AllAudienceParticipants
                      p_style={style}
                      participantList={audienceList}
                      isHost={props.isHost}
                    />
                  </View>
                );
              }}
            </ParticipantContextConsumer>
          </ParticipantContextProvider>
        ) : (
          <View style={style.participantsection}>
            <View style={style.participantContainer}>
              <AllHostParticipants p_style={style} isHost={props.isHost} />
            </View>
          </View>
        )}
      </ScrollView>
      <View
        style={{
          width: '100%',
          height: 50,
          alignSelf: 'flex-end',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <CopyJoinInfo showText={true} />
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  padding10: {
    padding: 10,
  },
  lineUnderHeading: {
    borderBottomWidth: 2,
    borderBottomColor: $config.PRIMARY_COLOR,
  },
  participantView: {
    width: '20%',
    minWidth: 200,
    maxWidth: 300,
    flex: 1,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    shadowColor: $config.PRIMARY_FONT_COLOR + '80',
    shadowOpacity: 0.5,
    shadowOffset: {width: -2, height: 0},
    shadowRadius: 3,
  },
  participantViewNative: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
    right: 0,
    top: 0,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
  },
  bodyContainer: {
    flex: 1,
  },
  participantsection: {
    marginBottom: 25,
  },
  mainHeading: {
    fontSize: 20,
    letterSpacing: 0.8,
    lineHeight: 30,
    color: $config.PRIMARY_FONT_COLOR,
  },
  infoText: {
    fontSize: 12,
    letterSpacing: 0.8,
    fontStyle: 'italic',
    color: $config.PRIMARY_FONT_COLOR,
  },
  participantContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 10,
    paddingBottom: 20,
  },
  participantRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  participantActionContainer: {
    flexDirection: 'row',
    paddingRight: 5,
    justifyContent: 'flex-end',
  },
  actionBtnIcon: {
    width: 25,
    height: 25,
  },
  participantText: {
    lineHeight: 24,
    fontSize: Platform.OS === 'web' ? 18 : 16,
    flexDirection: 'row',
    letterSpacing: 0.3,
    color: $config.PRIMARY_FONT_COLOR,
    fontWeight: '300',
  },
  participantTextSmall: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
  },
  dummyView: {
    flex: 0.5,
    opacity: 0,
    marginHorizontal: 5,
  },
  dummyView: {
    flex: 0.5,
    opacity: 0,
    marginHorizontal: 5,
  },
});

export default ParticipantView;

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
// @ts-nocheck
import React, {useState} from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import platform from '../subComponents/Platform';
import PrimaryButton from '../atoms/PrimaryButton';
import SecondaryButton from '../atoms/SecondaryButton';
import {BtnTemplate} from '../../agora-rn-uikit';
import {SHARE_LINK_CONTENT_TYPE, useShareLink} from './useShareLink';
import {useString} from '../utils/useString';
import isSDKCheck from '../utils/isSDK';
import Logo from '../components/common/Logo';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import useNavigateTo from '../utils/useNavigateTo';
import {useFpe} from 'fpe-api';
import {isValidReactComponent} from '../utils/common';
import Card from '../atoms/Card';
import Spacer from '../atoms/Spacer';
import LinkButton from '../atoms/LinkButton';
import icons from '../assets/icons';
import Icon from '../atoms/Icon';

const Share = () => {
  const {FpeShareComponent} = useFpe((data) => {
    let components: {
      FpeShareComponent?: React.ElementType;
    } = {};
    // commented for v1 release
    // if (
    //   data?.components?.share &&
    //   typeof data?.components?.share !== 'object'
    // ) {
    //   if (
    //     data?.components?.share &&
    //     isValidReactComponent(data?.components?.share)
    //   ) {
    //     components.FpeShareComponent = data?.components?.share;
    //   }
    // }
    return components;
  });
  const {copyShareLinkToClipboard, getShareLink} = useShareLink();
  const {meetingPassphrase, isSeparateHostLink} = useMeetingInfo();
  //commented for v1 release
  // const meetingUrlText = useString('meetingUrlLabel')();
  // const meetingIdText = useString('meetingIdLabel')();
  // const hostIdText = useString('hostIdLabel')();
  // const attendeeUrlLabel = useString('attendeeUrlLabel')();
  // const attendeeIdLabel = useString('attendeeIdLabel')();
  // const hostUrlLabel = useString('hostUrlLabel')();
  // const pstnLabel = useString('pstnLabel')();
  // const pstnNumberLabel = useString('pstnNumberLabel')();
  // const pinLabel = useString('pin')();
  // const enterMeetingAfterCreateButton = useString(
  //   'enterMeetingAfterCreateButton',
  // )();
  // const copyInviteButton = useString('copyInviteButton')();
  const meetingUrlText = 'Meeting URL';
  const meetingIdText = 'Meeting ID';
  const hostIdText = 'Host ID';
  const attendeeUrlLabel = 'Attendee URL';
  const attendeeIdLabel = 'Attendee ID';
  const hostUrlLabel = 'Host URL';
  const pstnLabel = 'PSTN';
  const pstnNumberLabel = 'Number';
  const pinLabel = 'Pin';
  const enterMeetingAfterCreateButton = 'Start Meeting (as host)';
  const copyInviteButton = 'Copy invite to clipboard';
  const navigateTo = useNavigateTo();
  const enterMeeting = () => {
    if (meetingPassphrase?.host) {
      navigateTo(meetingPassphrase.host);
    }
  };

  const [dim, setDim] = useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const isSDK = isSDKCheck();
  const isWeb = $config.FRONTEND_ENDPOINT || (platform === 'web' && !isSDK);

  const getAttendeeLabel = () => (isWeb ? attendeeUrlLabel : attendeeIdLabel);

  const getHostLabel = () => {
    if (isSeparateHostLink) {
      if (isWeb) {
        return hostUrlLabel;
      }
      return hostIdText;
    } else {
      if (isWeb) {
        return meetingUrlText;
      }
      return meetingIdText;
    }
  };
  return FpeShareComponent ? (
    <FpeShareComponent />
  ) : (
    <ScrollView contentContainerStyle={style.scrollMain}>
      <Card>
        <Logo />
        <Spacer size={20} />
        <View style={style.content} onLayout={onLayout}>
          <View style={style.leftContent}>
            <Text style={style.heading}>Your Meeting has been created.</Text>
            <Spacer size={40} />
            {/* <Text style={style.headline}>{$config.LANDING_SUB_HEADING}</Text> */}
            {isSeparateHostLink ? (
              <>
                <Text style={style.urlTitle}>{getAttendeeLabel()}</Text>
                <View style={style.urlContainer}>
                  <View style={{width: '90%'}}>
                    <View style={style.urlHolder}>
                      <Text style={[style.url, isWeb ? urlWeb : {opacity: 1}]}>
                        {getShareLink(SHARE_LINK_CONTENT_TYPE.ATTENDEE)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      marginLeft: 'auto',
                      flexDirection: 'row',
                      alignSelf: 'center',
                    }}>
                    {/* <View
                      style={{
                        backgroundColor: $config.PRIMARY_COLOR + '80',
                        width: 1,
                        height: 'auto',
                        marginRight: 15,
                      }}
                    /> */}
                    <Icon
                      uri={icons.copy}
                      width={17}
                      height={20}
                      onPress={() =>
                        copyShareLinkToClipboard(
                          SHARE_LINK_CONTENT_TYPE.ATTENDEE,
                        )
                      }
                    />
                    {/* <View style={style.clipboardIconHolder}>
                      <BtnTemplate
                        style={style.clipboardIcon}
                        color={$config.PRIMARY_COLOR}
                        name={'clipboard'}
                        onPress={() =>
                          copyShareLinkToClipboard(
                            SHARE_LINK_CONTENT_TYPE.ATTENDEE,
                          )
                        }
                      />
                    </View> */}
                  </View>
                </View>
                <Text style={style.helpText}>
                  Copy the invite and share it with attendees you want to
                  invite.
                </Text>
                <Spacer size={20} />
              </>
            ) : (
              <></>
            )}
            <>
              <Text style={style.urlTitle}>{getHostLabel()}</Text>
              <View style={style.urlContainer}>
                <View style={{width: '90%'}}>
                  <View style={style.urlHolder}>
                    <Text style={[style.url, isWeb ? urlWeb : {opacity: 1}]}>
                      {getShareLink(SHARE_LINK_CONTENT_TYPE.HOST)}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    marginLeft: 'auto',
                    flexDirection: 'row',
                    alignSelf: 'center',
                  }}>
                  <Icon
                    uri={icons.copy}
                    width={17}
                    height={20}
                    onPress={() =>
                      copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.HOST)
                    }
                  />
                  {/* <View style={style.clipboardIconHolder}>
                    <BtnTemplate
                      style={style.clipboardIcon}
                      color={$config.PRIMARY_COLOR}
                      name={'clipboard'}
                      onPress={() =>
                        copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.HOST)
                      }
                    />
                  </View> */}
                </View>
              </View>
              <Text style={style.helpText}>
                Copy the invite and share it with other co-hosts you want to
                invite
              </Text>
            </>
            {meetingPassphrase?.pstn ? (
              <>
                <Spacer size={20} />
                <Text style={style.urlTitle}>{pstnLabel}</Text>
                <View style={style.urlContainer}>
                  <View style={{width: '90%'}}>
                    <View>
                      <View style={style.pstnHolder}>
                        <Text style={style.url}>{pstnNumberLabel}: </Text>
                        <Text
                          style={[style.url, isWeb ? urlWeb : {opacity: 1}]}>
                          {meetingPassphrase?.pstn?.number}
                        </Text>
                      </View>
                      <View style={style.pstnHolder}>
                        <Text style={style.url}>{pinLabel}: </Text>
                        <Text
                          style={[style.url, isWeb ? urlWeb : {opacity: 1}]}>
                          {meetingPassphrase?.pstn?.pin}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{marginLeft: 'auto', flexDirection: 'row'}}>
                    <Icon
                      uri={icons.copy}
                      width={17}
                      height={20}
                      onPress={() =>
                        copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.PSTN)
                      }
                    />

                    {/* <View style={style.clipboardIconHolder}>
                      <BtnTemplate
                        style={style.clipboardIcon}
                        color={$config.PRIMARY_COLOR}
                        name={'clipboard'}
                        onPress={() =>
                          copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.PSTN)
                        }
                      />
                    </View> */}
                  </View>
                </View>
                <Text style={style.helpText}>
                  Copy the phone number and pin to dial from phone
                </Text>
              </>
            ) : (
              <></>
            )}
            <Spacer size={50} />
            <View style={style.btnContainer}>
              <PrimaryButton
                onPress={() => enterMeeting()}
                text={enterMeetingAfterCreateButton}
              />
              <Spacer size={16} />
              <LinkButton
                text={copyInviteButton}
                onPress={() =>
                  copyShareLinkToClipboard(
                    SHARE_LINK_CONTENT_TYPE.MEETING_INVITE,
                  )
                }
              />
              {/* <SecondaryButton
                onPress={() =>
                  copyShareLinkToClipboard(
                    SHARE_LINK_CONTENT_TYPE.MEETING_INVITE,
                  )
                }
                text={copyInviteButton}
              /> */}
            </View>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
};
const urlWeb = {wordBreak: 'break-all'};

const style = StyleSheet.create({
  full: {flex: 1},
  scrollMain: {
    paddingVertical: '8%',
    marginHorizontal: '8%',
    display: 'flex',
    justifyContent: 'space-evenly',
    flexGrow: 1,
  },
  main: {
    flex: 2,
    justifyContent: 'space-evenly',
    marginHorizontal: '8%',
    marginVertical: '2%',
  },
  content: {flex: 6, flexDirection: 'row'},
  leftContent: {
    width: '100%',
    flex: 1,
    justifyContent: 'space-evenly',

    // marginRight: '5%',
    marginHorizontal: 'auto',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',

    color: $config.PRIMARY_FONT_COLOR,
  },
  headline: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    color: $config.PRIMARY_FONT_COLOR,
    marginBottom: 20,
  },
  inputs: {
    flex: 1,
    width: '100%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  checkboxHolder: {
    marginVertical: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxTitle: {
    color: $config.PRIMARY_FONT_COLOR,
    paddingHorizontal: 5,
    fontWeight: '700',
  },
  checkboxCaption: {color: '#333', paddingHorizontal: 5},
  checkboxTextHolder: {
    marginVertical: 0, //check if 5
    flexDirection: 'column',
  },
  urlContainer: {
    // backgroundColor: $config.PRIMARY_COLOR + '22',
    // padding: 10,
    // marginBottom: 10,
    // borderRadius: 10,
    // width: '100%',
    // // minWidth: ''
    // maxWidth: 700,
    // flexDirection: 'row',
    // paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F2F2',
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  urlTitle: {
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 8,
  },
  pstnHolder: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  urlHolder: {
    width: '100%',
    // paddingHorizontal: 10,
    // marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    // maxWidth: 600,
    minHeight: 30,
  },
  url: {
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 14,
    fontWeight: '600',
    // textDecorationLine: 'underline',
  },
  // pstnHolder: {
  //   flexDirection: 'row',
  //   width: '80%',
  // },
  pstnMargin: {
    marginRight: '10%',
  },
  clipboardIconHolder: {
    width: 40,
    height: 40,
    marginVertical: 'auto',
  },
  clipboardIcon: {
    width: 40,
    height: 40,
    marginVertical: 'auto',
    opacity: 0.5,
    backgroundColor: 'transparent',
  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
  },
  helpText: {
    color: '#CCCCCC',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '400',
  },
  pstnTitle: {
    color: $config.PRIMARY_FONT_COLOR,
  },
});

export default Share;

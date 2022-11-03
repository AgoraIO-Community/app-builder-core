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
import {useHistory} from '../components/Router';
import {useCustomization} from 'customization-implementation';
import {isValidReactComponent} from '../utils/common';

const Share = () => {
  const {FpeShareComponent} = useCustomization((data) => {
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
  const {
    data: {roomId, pstn, isSeparateHostLink},
  } = useMeetingInfo();
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
  const history = useHistory();
  const enterMeeting = () => {
    if (roomId?.host) {
      history.push(roomId.host);
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
  const isWebCheck =
    $config.FRONTEND_ENDPOINT || (platform === 'web' && !isSDK);

  const getAttendeeLabel = () =>
    isWebCheck ? attendeeUrlLabel : attendeeIdLabel;

  const getHostLabel = () => {
    if (isSeparateHostLink) {
      if (isWebCheck) {
        return hostUrlLabel;
      }
      return hostIdText;
    } else {
      if (isWebCheck) {
        return meetingUrlText;
      }
      return meetingIdText;
    }
  };
  return FpeShareComponent ? (
    <FpeShareComponent />
  ) : (
    <ScrollView contentContainerStyle={style.scrollMain}>
      <Logo />
      <View style={style.content} onLayout={onLayout}>
        <View style={style.leftContent}>
          <Text style={style.heading}>{$config.APP_NAME}</Text>
          <Text style={style.headline}>{$config.LANDING_SUB_HEADING}</Text>
          {isSeparateHostLink ? (
            <View style={style.urlContainer}>
              <View style={{width: '80%'}}>
                <Text style={style.urlTitle}>{getAttendeeLabel()}</Text>
                <View style={style.urlHolder}>
                  <Text style={[style.url, isWebCheck ? urlWeb : {opacity: 1}]}>
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
                <View
                  style={{
                    backgroundColor: $config.PRIMARY_COLOR + '80',
                    width: 1,
                    height: 'auto',
                    marginRight: 15,
                  }}
                />
                <View style={style.clipboardIconHolder}>
                  <BtnTemplate
                    style={style.clipboardIcon}
                    color={$config.PRIMARY_COLOR}
                    name={'clipboard'}
                    onPress={() =>
                      copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.ATTENDEE)
                    }
                  />
                </View>
              </View>
            </View>
          ) : (
            <></>
          )}
          <View style={style.urlContainer}>
            <View style={{width: '80%'}}>
              <Text style={style.urlTitle}>{getHostLabel()}</Text>
              <View style={style.urlHolder}>
                <Text style={[style.url, isWebCheck ? urlWeb : {opacity: 1}]}>
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
              <View
                style={{
                  backgroundColor: $config.PRIMARY_COLOR + '80',
                  width: 1,
                  height: 'auto',
                  marginRight: 15,
                }}
              />
              <View style={style.clipboardIconHolder}>
                <BtnTemplate
                  style={style.clipboardIcon}
                  color={$config.PRIMARY_COLOR}
                  name={'clipboard'}
                  onPress={() =>
                    copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.HOST)
                  }
                />
              </View>
            </View>
          </View>
          {pstn ? (
            <View style={style.urlContainer}>
              <View style={{width: '80%'}}>
                <Text style={style.urlTitle}>{pstnLabel}</Text>
                <View>
                  <View style={style.pstnHolder}>
                    <Text style={style.urlTitle}>{pstnNumberLabel}: </Text>
                    <Text
                      style={[style.url, isWebCheck ? urlWeb : {opacity: 1}]}>
                      {pstn?.number}
                    </Text>
                  </View>
                  <View style={style.pstnHolder}>
                    <Text style={style.urlTitle}>{pinLabel}: </Text>
                    <Text
                      style={[style.url, isWebCheck ? urlWeb : {opacity: 1}]}>
                      {pstn?.pin}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{marginLeft: 'auto', flexDirection: 'row'}}>
                <View
                  style={{
                    backgroundColor: $config.PRIMARY_COLOR + '80',
                    width: 1,
                    height: 'auto',
                    marginRight: 15,
                  }}
                />
                <View style={style.clipboardIconHolder}>
                  <BtnTemplate
                    style={style.clipboardIcon}
                    color={$config.PRIMARY_COLOR}
                    name={'clipboard'}
                    onPress={() =>
                      copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.PSTN)
                    }
                  />
                </View>
              </View>
            </View>
          ) : (
            <></>
          )}
          <PrimaryButton
            onPress={() => enterMeeting()}
            text={enterMeetingAfterCreateButton}
          />
          <View style={{height: 10}} />
          <SecondaryButton
            onPress={() =>
              copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.MEETING_INVITE)
            }
            text={copyInviteButton}
          />
        </View>
      </View>
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
    marginBottom: '12%',
    marginTop: '2%',
    // marginRight: '5%',
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    color: $config.PRIMARY_FONT_COLOR,
    marginBottom: 20,
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
    backgroundColor: $config.PRIMARY_COLOR + '22',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    width: '100%',
    // minWidth: ''
    maxWidth: 700,
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  urlTitle: {
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'left',
  },
  pstnHolder: {
    width: '100%',
    // paddingHorizontal: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 10,
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
    fontSize: 18,
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
});

export default Share;

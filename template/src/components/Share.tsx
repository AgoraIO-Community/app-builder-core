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
import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import platform from '../subComponents/Platform';
import PrimaryButton from '../atoms/PrimaryButton';
import SecondaryButton from '../atoms/SecondaryButton';
import {BtnTemplate, ImageIcon} from '../../agora-rn-uikit';
import {SHARE_LINK_CONTENT_TYPE, useShareLink} from './useShareLink';
import {useString} from '../utils/useString';
import isSDKCheck from '../utils/isSDK';
import Logo from '../components/common/Logo';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import {useHistory} from '../components/Router';
import {useCustomization} from 'customization-implementation';
import {isValidReactComponent} from '../utils/common';
import Card from '../atoms/Card';
import Spacer from '../atoms/Spacer';
import LinkButton from '../atoms/LinkButton';
import DimensionContext from '../components/dimension/DimensionContext';

const isLiveStream = $config.EVENT_MODE;

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
    data: {roomId, pstn, isSeparateHostLink, meetingTitle},
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
  const meetingUrlText = 'Meeting Link';
  const meetingIdText = 'Meeting ID';
  const hostIdText = 'Host ID';
  const attendeeUrlLabel = 'Attendee Link';
  const attendeeIdLabel = 'Attendee ID';
  const hostUrlLabel = 'Host Link';
  const pstnLabel = 'PSTN';
  const pstnNumberLabel = 'Number';
  const pinLabel = 'Pin';
  const enterMeetingAfterCreateButton = isLiveStream
    ? 'Start Stream (as host)'
    : 'Start Meeting (as host)';
  const copyInviteButton = 'Copy invite to clipboard';
  const history = useHistory();
  const enterMeeting = () => {
    if (roomId?.host) {
      history.push(roomId.host);
    }
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
  let onLayout = (e: any) => {
    setDim([e.nativeEvent.layout.width, e.nativeEvent.layout.height]);
  };
  const [dim, setDim] = React.useState([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);

  const {getDimensionData} = useContext(DimensionContext);
  const {isDesktop} = getDimensionData();

  return FpeShareComponent ? (
    <FpeShareComponent />
  ) : (
    <ScrollView contentContainerStyle={style.scrollMain} onLayout={onLayout}>
      <Card isDesktop={isDesktop}>
        <View>
          <Logo />
          <Spacer size={20} />
          <Text style={style.heading}>{meetingTitle}</Text>
          <Spacer size={40} />
          {isSeparateHostLink ? (
            <>
              <Text style={style.urlTitle}>{getAttendeeLabel()}</Text>
              <Spacer size={11} />
              <View style={style.container}>
                <View style={style.urlContainer}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[
                      style.url,
                      style.urlPadding,
                      //@ts-ignore
                      isWebCheck ? urlWeb : {opacity: 1},
                    ]}>
                    {getShareLink(SHARE_LINK_CONTENT_TYPE.ATTENDEE)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={style.iconContainer}
                  onPress={() => {
                    copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.ATTENDEE);
                  }}>
                  <ImageIcon
                    style={{width: 24, height: 24}}
                    name={'clipboard'}
                  />
                </TouchableOpacity>
              </View>
              <Spacer size={14} />
              {isDesktop && (
                <Text style={style.helpText}>
                  Share this with attendees you want to invite.
                </Text>
              )}
              <Spacer size={25} />
            </>
          ) : (
            <></>
          )}
          <>
            <Text style={style.urlTitle}>{getHostLabel()}</Text>
            <Spacer size={11} />
            <View style={style.container}>
              <View style={style.urlContainer}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    style.url,
                    style.urlPadding,
                    //@ts-ignore
                    isWebCheck ? urlWeb : {opacity: 1},
                  ]}>
                  {getShareLink(SHARE_LINK_CONTENT_TYPE.HOST)}
                </Text>
              </View>
              <View style={style.iconContainer}>
                <TouchableOpacity
                  style={style.iconContainer}
                  onPress={() => {
                    copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.HOST);
                  }}>
                  <ImageIcon
                    style={{width: 24, height: 24}}
                    name={'clipboard'}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Spacer size={14} />
            {isDesktop && (
              <Text style={style.helpText}>
                Share this with other co-hosts you want to invite.
              </Text>
            )}
            <Spacer size={25} />
          </>
          {pstn ? (
            <>
              <Text style={style.urlTitle}>{pstnLabel}</Text>
              <Spacer size={11} />
              <View style={style.container}>
                <View style={[style.urlContainer, style.urlPadding]}>
                  <View>
                    <Text
                      style={[
                        style.url,
                        //@ts-ignore
                        isWebCheck ? urlWeb : {opacity: 1},
                      ]}>
                      {pstnNumberLabel} - {pstn?.number}
                    </Text>
                  </View>
                  <Spacer size={11} />
                  <View>
                    <Text
                      style={[
                        style.url,
                        //@ts-ignore
                        isWebCheck ? urlWeb : {opacity: 1},
                      ]}>
                      {pinLabel} - {pstn?.pin}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={style.iconContainer}
                  onPress={() => {
                    copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.PSTN);
                  }}>
                  <ImageIcon
                    style={{width: 24, height: 24}}
                    name={'clipboard'}
                  />
                </TouchableOpacity>
              </View>
              <Spacer size={14} />
              {isDesktop && (
                <Text style={style.helpText}>
                  Share this phone number and pin to dial from phone.
                </Text>
              )}
              <Spacer size={25} />
            </>
          ) : (
            <></>
          )}
          <Spacer size={60} />
        </View>
        <View style={style.btnContainer}>
          <PrimaryButton
            iconName="videocamWhite"
            onPress={() => enterMeeting()}
            containerStyle={!isDesktop && {width: '100%'}}
            text={enterMeetingAfterCreateButton}
          />
          <Spacer size={16} />
          <LinkButton
            text={copyInviteButton}
            onPress={() =>
              copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.MEETING_INVITE)
            }
          />
        </View>
      </Card>
    </ScrollView>
  );
};
const urlWeb = {wordBreak: 'break-all'};

const style = StyleSheet.create({
  scrollMain: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Source Sans Pro',
    color: $config.PRIMARY_FONT_COLOR,
  },
  container: {
    flexDirection: 'row',
  },
  urlTitle: {
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
    paddingLeft: 8,
  },
  urlContainer: {
    flex: 0.9,
    backgroundColor: '#F1F1F4',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  iconContainer: {
    flex: 0.1,
    backgroundColor: '#F1F1F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 0,
  },
  url: {
    color: 'rgba(51, 51, 51, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
  },
  urlPadding: {
    paddingHorizontal: 20,
    paddingVertical: 21,
  },
  clipboardIcon: {
    width: 17,
    height: 20,
  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
  },
  helpText: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
    paddingLeft: 8,
  },
});

export default Share;

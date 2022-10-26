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
import Card from '../atoms/Card';
import Spacer from '../atoms/Spacer';
import LinkButton from '../atoms/LinkButton';
import {icons} from 'customization-api';
import Icon from '../atoms/Icon';

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
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[
                          style.url,
                          //@ts-ignore
                          isWebCheck ? urlWeb : {opacity: 1},
                        ]}>
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
                    {/* </View> */}
                  </View>
                </View>
                <Text style={style.helpText}>
                  Share this with attendees you want to invite.
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
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        style.url,
                        //@ts-ignore
                        isWebCheck ? urlWeb : {opacity: 1},
                      ]}>
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
              <Text style={style.helpText}>
                Share this with other co-hosts you want to invite.
              </Text>
            </>
            {pstn ? (
              <>
                <Spacer size={20} />
                <Text style={style.urlTitle}>{pstnLabel}</Text>
                <View style={style.urlContainer}>
                  <View style={{width: '90%'}}>
                    <View>
                      <View style={style.pstnHolder}>
                        <Text style={style.url}>{pstnNumberLabel}: </Text>
                        <Text
                          style={[
                            style.url,
                            //@ts-ignore
                            isWebCheck ? urlWeb : {opacity: 1},
                          ]}>
                          {pstn?.number}
                        </Text>
                      </View>
                      <View style={style.pstnHolder}>
                        <Text style={style.url}>{pinLabel}: </Text>
                        <Text
                          style={[
                            style.url,
                            //@ts-ignore
                            isWebCheck ? urlWeb : {opacity: 1},
                          ]}>
                          {pstn?.pin}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{marginLeft: 'auto', flexDirection: 'row'}}>
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
                <Text style={style.helpText}>
                  Share this phone number and pin to dial from phone.
                </Text>
              </>
            ) : (
              <></>
            )}
            <Spacer size={50} />
            <View style={style.btnContainer}>
              <PrimaryButton
                icon={icons.createMeeting}
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
    display: 'flex',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
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
    fontFamily: 'Source Sans Pro',
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
    fontFamily: 'Source Sans Pro',
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
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 30,
  },
  url: {
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Source Sans Pro',
  },

  pstnMargin: {
    marginRight: '10%',
  },
  clipboardIcon: {
    width: 17,
    height: 20,
    marginVertical: 'auto',
  },
  btnContainer: {
    width: '100%',
    alignItems: 'center',
  },
  helpText: {
    color: '#666666',
    marginTop: 10,
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
  },
  pstnTitle: {
    color: $config.PRIMARY_FONT_COLOR,
    fontFamily: 'Source Sans Pro',
  },
});

export default Share;

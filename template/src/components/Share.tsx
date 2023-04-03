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
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import platform from '../subComponents/Platform';
import PrimaryButton from '../atoms/PrimaryButton';
import SecondaryButton from '../atoms/SecondaryButton';
import {SHARE_LINK_CONTENT_TYPE, useShareLink} from './useShareLink';
import {useString} from '../utils/useString';
import isSDKCheck from '../utils/isSDK';
import Logo from '../components/common/Logo';
import {useMeetingInfo} from './meeting-info/useMeetingInfo';
import {useHistory} from '../components/Router';
import {useCustomization} from 'customization-implementation';
import {isMobileUA, isValidReactComponent, trimText} from '../utils/common';
import Card from '../atoms/Card';
import Spacer from '../atoms/Spacer';
import LinkButton from '../atoms/LinkButton';
import ImageIcon from '../atoms/ImageIcon';
import ThemeConfig from '../theme';
import Tooltip from '../atoms/Tooltip';
import IDPLogoutComponent from '../auth/IDPLogoutComponent';

const isLiveStream = $config.EVENT_MODE;

export interface CopyMeetingInfoProps {
  showSubLabel?: boolean;
}
export const CopyMeetingInfo = (props?: CopyMeetingInfoProps) => {
  const {copyShareLinkToClipboard, getShareLink} = useShareLink();
  const {
    data: {roomId, isHost, pstn, isSeparateHostLink, meetingTitle},
  } = useMeetingInfo();
  const {showSubLabel = true} = props;
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

  const clipboardIconButton = (type: SHARE_LINK_CONTENT_TYPE) => {
    return (
      <View style={style.iconContainer}>
        <Tooltip
          isClickable
          onPress={() => {
            copyShareLinkToClipboard(type);
          }}
          toolTipIcon={
            <>
              <ImageIcon
                iconType="plain"
                name="tick-fill"
                tintColor={$config.SEMANTIC_SUCCESS}
              />
              <Spacer size={8} horizontal={true} />
            </>
          }
          toolTipMessage="Copied to clipboard"
          renderContent={(isToolTipVisible, setToolTipVisible) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  copyShareLinkToClipboard(type, () => {
                    setToolTipVisible(true);
                  });
                  //setToolTipVisible(true);
                }}>
                <ImageIcon
                  iconType="plain"
                  name="clipboard"
                  tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };
  return (
    <>
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
            {clipboardIconButton(SHARE_LINK_CONTENT_TYPE.ATTENDEE)}
          </View>

          {showSubLabel && (
            <>
              <Spacer size={14} />
              <Text style={style.helpText}>
                Share this with attendees you want to invite.
              </Text>
            </>
          )}
          <Spacer size={25} />
        </>
      ) : (
        <></>
      )}
      {isHost ? (
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
            {clipboardIconButton(SHARE_LINK_CONTENT_TYPE.HOST)}
          </View>

          {showSubLabel && (
            <>
              <Spacer size={14} />
              <Text style={style.helpText}>
                Share this with other co-hosts you want to invite.
              </Text>
            </>
          )}
          <Spacer size={25} />
        </>
      ) : (
        <></>
      )}
      {$config.PSTN && pstn && pstn?.number && pstn?.pin ? (
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
                  {pstnNumberLabel} - {pstn?.number} {' | '} {pinLabel} -{' '}
                  {pstn?.pin}
                </Text>
              </View>
            </View>
            {clipboardIconButton(SHARE_LINK_CONTENT_TYPE.PSTN)}
          </View>

          {showSubLabel && (
            <>
              <Spacer size={14} />
              <Text style={style.helpText}>
                Share this phone number and pin to dial from phone.
              </Text>
            </>
          )}
          {/* <Spacer size={25} /> */}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

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
  const {copyShareLinkToClipboard} = useShareLink();
  const {
    data: {roomId, meetingTitle},
  } = useMeetingInfo();

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

  return FpeShareComponent ? (
    <FpeShareComponent />
  ) : (
    <View style={style.root}>
      {!isMobileUA() ? (
        <IDPLogoutComponent containerStyle={{marginBottom: -100}} />
      ) : (
        <></>
      )}
      <ScrollView contentContainerStyle={style.scrollMain}>
        <Card>
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Logo />
              {isMobileUA() ? (
                <IDPLogoutComponent
                  containerStyle={{marginTop: 0, marginRight: 0}}
                />
              ) : (
                <></>
              )}
            </View>
            <Spacer size={20} />
            <Text style={style.heading} numberOfLines={1}>
              {trimText(meetingTitle)}
            </Text>
            <Spacer size={40} />
            <CopyMeetingInfo />
            <Spacer size={60} />
          </View>
          <View style={style.btnContainer}>
            <PrimaryButton
              iconName="video-on"
              onPress={() => enterMeeting()}
              containerStyle={isMobileUA() && {width: '100%'}}
              text={enterMeetingAfterCreateButton.toUpperCase()}
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
    </View>
  );
};
const urlWeb = {wordBreak: 'break-all'};

const style = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollMain: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  heading: {
    fontSize: ThemeConfig.FontSize.extraLarge,
    fontWeight: '700',
    lineHeight: ThemeConfig.FontSize.extraLarge,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    paddingVertical: 2,
  },
  container: {
    flexDirection: 'row',
  },
  urlTitle: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.medium,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    paddingLeft: 8,
  },
  urlContainer: {
    flex: 0.9,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderWidth: 1,
    borderTopLeftRadius: ThemeConfig.BorderRadius.medium,
    borderBottomLeftRadius: ThemeConfig.BorderRadius.medium,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  iconContainer: {
    flex: 0.1,
    minWidth: 25,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderLeftWidth: 0,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopRightRadius: ThemeConfig.BorderRadius.medium,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: ThemeConfig.BorderRadius.medium,
    borderTopLeftRadius: 0,
  },
  url: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.medium,
    fontSize: ThemeConfig.FontSize.small,
    fontWeight: '600',
    fontFamily: ThemeConfig.FontFamily.sansPro,
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
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.disabled,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: ThemeConfig.FontSize.small,
    fontWeight: '400',
    fontFamily: ThemeConfig.FontFamily.sansPro,
    paddingLeft: 8,
  },
});

export default Share;

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
import {StyleSheet} from 'react-native';
import {useParams} from '../components/Router';
import {BtnTemplate} from '../../agora-rn-uikit';
import {useString} from '../utils/useString';
import useGetMeetingPhrase from '../utils/useGetMeetingPhrase';
import {
  SHARE_LINK_CONTENT_TYPE,
  useShareLink,
} from '../components/useShareLink';

const CopyJoinInfo = (props: {showText?: boolean}) => {
  const {phrase} = useParams<{phrase: string}>();
  const getMeeting = useGetMeetingPhrase();
  const {copyShareLinkToClipboard} = useShareLink();
  const copyMeetingInviteButton = useString('copyMeetingInviteButton')();

  useEffect(() => {
    getMeeting(phrase);
  }, [phrase]);

  return (
    <BtnTemplate
      style={style.backButton}
      onPress={() =>
        copyShareLinkToClipboard(SHARE_LINK_CONTENT_TYPE.MEETING_INVITE)
      }
      name={'clipboard'}
      btnText={props.showText ? copyMeetingInviteButton : ''}
      color={$config.PRIMARY_FONT_COLOR}
    />
  );
};

const style = StyleSheet.create({
  backButton: {
    // marginLeft: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 28,
    height: 20,
  },
  backIcon: {
    width: 28,
    height: 20,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export default CopyJoinInfo;

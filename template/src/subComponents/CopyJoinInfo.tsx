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
import {useParams} from '../components/Router';
import useGetMeetingPhrase from '../utils/useGetMeetingPhrase';
import TertiaryButton from '../atoms/TertiaryButton';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
import {useVideoCall} from '../components/useVideoCall';

export interface CopyJoinInfoProps {
  showLabel?: boolean;
  showTeritaryButton?: boolean;
  render?: (onPress: () => void) => JSX.Element;
  isOnActionSheet?: boolean;
}

const CopyJoinInfo = (props: CopyJoinInfoProps) => {
  const {
    showLabel = $config.ICON_TEXT || false,
    showTeritaryButton = false,
    isOnActionSheet = false,
  } = props;
  //commented for v1 release
  //const copyMeetingInviteButton = useString('copyMeetingInviteButton')();
  const copyMeetingInviteButton = 'Invite';
  const {setShowInvitePopup} = useVideoCall();

  const onPress = () => {
    setShowInvitePopup(true);
  };
  let iconButtonProps: IconButtonProps = {
    onPress: onPress,
    iconProps: {
      name: 'share',
      tintColor: $config.SECONDARY_ACTION_COLOR,
    },
    btnTextProps: {
      textColor: $config.FONT_COLOR,
      text: showLabel ? copyMeetingInviteButton : '',
    },
  };

  iconButtonProps.isOnActionSheet = isOnActionSheet;

  return props?.render ? (
    props.render(onPress)
  ) : (
    <>
      {showTeritaryButton ? (
        <TertiaryButton text="Invite" onPress={onPress} />
      ) : (
        <IconButton {...iconButtonProps} />
      )}
    </>
  );
};

export default CopyJoinInfo;

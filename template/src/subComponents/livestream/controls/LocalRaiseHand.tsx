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
import React, {useContext} from 'react';
import LiveStreamContext, {
  RaiseHandValue,
} from '../../../components/livestream';
import {useString} from '../../../utils/useString';
import Styles from '../../../components/styles';
import ChatContext from '../../../components/ChatContext';
import IconButton from '../../../atoms/IconButton';
import ThemeConfig from '../../../theme';
import {ClientRole, PropsContext} from '../../../../agora-rn-uikit';
import {useRender} from 'customization-api';
import {isMobileUA} from '../../../utils/common';

interface LocalRaiseHandProps {
  showLabel?: boolean;
}
const LocalRaiseHand = (props: LocalRaiseHandProps) => {
  const {audienceSendsRequest, audienceRecallsRequest, raiseHandList} =
    useContext(LiveStreamContext);
  const {rtcProps} = useContext(PropsContext);
  const {localUid} = useContext(ChatContext);
  const {activeUids} = useRender();
  const {showLabel = $config.ICON_TEXT} = props;
  //commented for v1 release
  //const handStatusText = useString<boolean>('raiseHandButton');
  const handStatusText = (toggle: boolean) =>
    toggle ? 'Lower hand' : 'Raise Hand';
  const isHandRasied = raiseHandList[localUid]?.raised === RaiseHandValue.TRUE;
  return (
    <IconButton
      iconProps={{
        name: isHandRasied ? 'lower-hand' : 'raise-hand',
        tintColor: isHandRasied
          ? $config.PRIMARY_ACTION_TEXT_COLOR
          : $config.SECONDARY_ACTION_COLOR,
        iconBackgroundColor: isHandRasied
          ? $config.PRIMARY_ACTION_BRAND_COLOR
          : '',
        base64: isMobileUA() ? true : false,
      }}
      btnTextProps={{
        text: showLabel ? handStatusText(isHandRasied) : '',
        textColor: $config.FONT_COLOR,
      }}
      onPress={() => {
        if (isHandRasied) {
          audienceRecallsRequest();
        } else {
          audienceSendsRequest();
        }
      }}
    />
  );
};

export default LocalRaiseHand;

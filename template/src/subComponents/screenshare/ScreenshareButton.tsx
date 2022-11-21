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
import React from 'react';
import IconButton, {IconButtonProps} from '../../atoms/IconButton';
import Styles from '../../components/styles';
import {useString} from '../../utils/useString';
import {useScreenshare} from './useScreenshare';
/**
 * A component to start and stop screen sharing on web clients.
 * Screen sharing is not yet implemented on mobile platforms.
 * Electron has it's own screen sharing component
 */

export interface ScreenshareButtonProps {
  render?: (onPress: () => void, isScreenshareActive: boolean) => JSX.Element;
}

const ScreenshareButton = (props: ScreenshareButtonProps) => {
  const {isScreenshareActive, startUserScreenshare, stopUserScreenShare} =
    useScreenshare();
  //commented for v1 release
  //const screenShareButton = useString('screenShareButton')();

  const onPress = () =>
    isScreenshareActive ? stopUserScreenShare() : startUserScreenshare();
  let iconButtonProps: IconButtonProps = {
    iconProps: {
      name: isScreenshareActive ? 'screenShareStop' : 'screenShare',
      tintColor: isScreenshareActive ? '#FF414D' : '#099DFD',
    },
    onPress,
  };

  const screenShareButton = isScreenshareActive
    ? 'Stop Sharing'
    : 'Share Screen';
  iconButtonProps.btnText = screenShareButton;
  iconButtonProps.style = Styles.localButton as object;
  iconButtonProps.styleText = {
    fontFamily: 'Source Sans Pro',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
    color: isScreenshareActive ? '#FF414D' : '#099DFD',
  };

  return props?.render ? (
    props.render(onPress, isScreenshareActive)
  ) : (
    <IconButton {...iconButtonProps} />
  );
};

export default ScreenshareButton;

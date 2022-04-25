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
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native';
import ColorContext from '../../components/ColorContext';
import {ImageIcon} from '../../../agora-rn-uikit';
import ScreenshareContext from './ScreenshareContext';
/**
 * A component to start and stop screen sharing on web clients.
 * Screen sharing is not yet implemented on mobile platforms.
 * Electron has it's own screen sharing component
 */
const ScreenshareButton = () => {
  const {screenshareActive, startUserScreenshare} =
    useContext(ScreenshareContext);
  const {primaryColor} = useContext(ColorContext);

  return (
    <TouchableOpacity onPress={() => startUserScreenshare()}>
      <View
        style={
          screenshareActive
            ? style.greenLocalButton
            : [style.localButton, {borderColor: primaryColor}]
        }>
        <ImageIcon
          name={screenshareActive ? 'screenshareOffIcon' : 'screenshareIcon'}
          style={[style.buttonIcon]}
        />
      </View>
      <Text
        style={{
          textAlign: 'center',
          marginTop: 5,
          color: $config.PRIMARY_COLOR,
        }}>
        Share
      </Text>
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  localButton: {
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    borderRadius: 20,
    borderColor: $config.PRIMARY_COLOR,
    width: 40,
    height: 40,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenLocalButton: {
    backgroundColor: '#4BEB5B',
    borderRadius: 20,
    borderColor: '#F86051',
    width: 40,
    height: 40,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    width: '90%',
    height: '90%',
  },
});

export default ScreenshareButton;

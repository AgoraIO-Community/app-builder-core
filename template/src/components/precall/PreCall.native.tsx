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
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { useFpe } from 'fpe-api';
import { cmpTypeGuard } from '../../utils/common';

import PreCallVideoPreview from './VideoPreview';
import PreCallLocalMute from './LocalMute.native';
import PreCallTextInput from './textInput';
import PreCallJoinBtn from './joinCallBtn'

const Precall = () => {
  const {
    preview,
    textBox,
    joinButton
  } = useFpe(data => typeof data.components?.precall === 'object' ? data.components?.precall : {})

  return (
    <View style={style.full}>
      <View style={style.heading}>
        <Text style={style.headingText}>Precall </Text>
      </View>
      <View style={style.full}>
        {cmpTypeGuard(preview, PreCallVideoPreview)}
      </View>
      <View style={style.textInputHolder}>
        {cmpTypeGuard(textBox, PreCallTextInput)}
      </View>
      <View style={{ height: 20 }} />
      <View style={style.controls}>
        <PreCallLocalMute />
      </View>
      <View
        style={{ marginBottom: 50 }}>
        {cmpTypeGuard(joinButton, PreCallJoinBtn)}
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  full: { flex: 1 },
  heading: { flex: 0.1, justifyContent: 'center' },
  headingText: {
    fontSize: 24,
    color: $config.PRIMARY_FONT_COLOR,
    fontWeight: '700',
    alignSelf: 'center',
  },
  textInputHolder: {
    flex: 0.1,
    alignSelf: 'center',
    paddingTop: 20,
    width: '100%',
  },
  controls: {
    flex: 0.2,
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 5,
  },
});

export default Precall;

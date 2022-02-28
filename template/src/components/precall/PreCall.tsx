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
import React, { useContext, useEffect, useState} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {usePreCall} from 'fpe-api/api';
import DimensionContext from '../dimension/DimensionContext';

import { useFpe } from 'fpe-api/api';
import { cmpTypeGuard } from '../../utils/common';
import { PreCallCmpType } from 'fpe-api/typeDef';
// Precall subcomponents
import PreCallLogo from '../common/Logo';
import PreCallVideoPreview from './VideoPreview';
import PreCallLocalMute from './LocalMute';
import PreCallSetName from './setName';
import PreCallSelectDevice from './selectDevice';

const Precall = () => {

  const {
    PreCallLogo:LogoFpe,PreCallLocalMute: Mute,
    PreCallSelectDevice: selectDevice,PreCallSetName: setName,
    PreCallVideoPreview: videoPreview
  } = useFpe(data => typeof data.components?.PreCallScreen === 'object' ? data.components?.PreCallScreen : {} as PreCallCmpType )
  
  const {title} = usePreCall(data => data)
  const {getDimensionData} = useContext(DimensionContext)
  const [isDesktop, setDesktop] = useState(false)
  
  let onLayout = (e: any) => {
    const {isDesktop} = getDimensionData(e.nativeEvent.layout.width, e.nativeEvent.layout.height);
    setDesktop(isDesktop)
  };

  useEffect(()=>{
    if(Platform.OS === 'web'){
      if(title){
        document.title = title + ' | ' + $config.APP_NAME
      }
    }
  })
  return (
    <View style={style.main} onLayout={onLayout}>
      {cmpTypeGuard(LogoFpe, PreCallLogo)}
      <View style={style.content}>
        <View style={style.leftContent}>
          {cmpTypeGuard(videoPreview,PreCallVideoPreview)}
          {cmpTypeGuard(Mute,PreCallLocalMute)}
          {!isDesktop && (
            cmpTypeGuard(setName ,PreCallSetName)
          )}
        </View>
        {isDesktop && (
           cmpTypeGuard(selectDevice,PreCallSelectDevice)
        )}
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  full: {flex: 1},
  main: {
    flex: 2,
    justifyContent: 'space-evenly',
    marginHorizontal: '10%',
    minHeight: 500,
  },
  nav: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {flex: 6, flexDirection: 'row'},
  leftContent: {
    width: '100%',
    flex: 1.3,
    justifyContent: 'space-evenly',
    marginTop: '2.5%',
    marginBottom: '1%',
    // marginRight: '5%',
  },
  titleHeading: {
    fontSize: 28,
    fontWeight: '700',
    color: $config.SECONDARY_FONT_COLOR,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: $config.SECONDARY_FONT_COLOR,
  },
  headline: {
    fontSize: 20,
    fontWeight: '400',
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
  textInput: {
    width: '100%',
    paddingLeft: 8,
    borderColor: $config.PRIMARY_COLOR,
    borderWidth: 2,
    color: $config.PRIMARY_FONT_COLOR,
    fontSize: 16,
    marginBottom: 15,
    maxWidth: 400,
    minHeight: 45,
    alignSelf: 'center',
  },
  primaryBtn: {
    width: '60%',
    backgroundColor: $config.PRIMARY_COLOR,
    maxWidth: 400,
    minHeight: 45,
    alignSelf: 'center',
  },
  primaryBtnDisabled: {
    width: '60%',
    backgroundColor: $config.PRIMARY_FONT_COLOR + '80',
    maxWidth: 400,
    minHeight: 45,
    minWidth: 200,
    alignSelf: 'center',
  },
  primaryBtnText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: $config.SECONDARY_FONT_COLOR,
  },
  ruler: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    width: '100%',
    maxWidth: 200,
  },
  precallControls: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 10,
    width: '40%',
    justifyContent: 'space-around',
    marginVertical: '5%',
  },
  precallPickers: {
    alignItems: 'center',
    alignSelf: 'center',
    // alignContent: 'space-around',
    justifyContent: 'space-around',
    // flex: 1,
    marginBottom: '10%',
    height: '35%',
    minHeight: 280,
  },
  margin5Btm: {marginBottom: '5%'},
});

export default Precall;

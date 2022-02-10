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
import PreCall from './PreCall';
import PreCallLocalMute from './LocalMute';
import PreCallVideoPreview from './VideoPreview';
import PreCallSetName from './setName';
import PreCallSelectDevice from './selectDevice';
import {LocalAudioMute,LocalVideoMute} from '../../../agora-rn-uikit';
import PreCallJoinBtn from './joinCallBtn'
import PreCallTextInput from './textInput';
const PreCallLocalAudioMute = () => <LocalAudioMute />;
const PreCallLocalVideoMute = () => <LocalVideoMute />;
export {
  PreCall,
  PreCallLocalMute,
  PreCallVideoPreview,
  PreCallLocalAudioMute,
  PreCallLocalVideoMute,
  PreCallSetName,
  PreCallSelectDevice,
  PreCallJoinBtn,
  PreCallTextInput
};
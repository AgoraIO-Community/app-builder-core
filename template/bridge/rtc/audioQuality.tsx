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
const audioQuality = {
  speech_low_quality: 'speech_low_quality',
  speech_standard: 'speech_standard',
  music_standard: 'music_standard',
  standard_stereo: 'standard_stereo',
  high_quality: 'high_quality',
  high_quality_stereo: 'high_quality_stereo',
};

export default audioQuality;
export type AudioProfile = keyof typeof audioQuality;

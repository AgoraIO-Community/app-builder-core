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
import {View, Text} from 'react-native';
import ParticipantName from './ParticipantName';

const ScreenshareParticipants = (props: any) => {
  const {p_styles, name} = props;
  return (
    <View style={p_styles.participantRow}>
      <ParticipantName value={name} />
      <View style={p_styles.dummyView}>
        {/** its just the placeholder to adjust the UI. if no icon option to be shown */}
        <Text>local screen sharing</Text>
      </View>
    </View>
  );
};
export default ScreenshareParticipants;

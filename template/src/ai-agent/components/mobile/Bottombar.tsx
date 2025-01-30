import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ToolbarComponents, useRoomInfo} from 'customization-api';
import {AgentControl} from '../AgentControls';

const Bottombar = () => {
  const [clientId, setClientId] = useState<string | null>(null);
  const {LocalAudioToolbarItem} = ToolbarComponents;
  const {data} = useRoomInfo();
  const css = `
    [data-testid="localAudio-btn"]{
      padding-bottom: 0px !important;
    }
  `;
  return (
    <>
      <style type="text/css">{css}</style>
      <View style={style.containerStyle}>
        <LocalAudioToolbarItem
          iconBGColor={'#00C2FF'}
          iconSize={32}
          containerStyle={{padding: 20}}
        />
        <AgentControl
          channel_name={data.channel}
          style={{fontSize: 18, lineHeight: 18}}
          clientId={clientId}
          setClientId={setClientId}
        />
      </View>
    </>
  );
};

const style = StyleSheet.create({
  containerStyle: {
    paddingTop: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
  },
});

export default Bottombar;

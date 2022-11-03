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
import {layoutComponent, useRtc} from 'customization-api';
import React, {useMemo, useState} from 'react';
import {View, StyleSheet, Dimensions, Pressable} from 'react-native';
import {isWebInternal} from '../utils/common';
import {useSetPinnedLayout} from '../pages/video-call/DefaultLayouts';
import RenderComponent from '../pages/video-call/RenderComponent';
const layout = (len: number, isDesktop: boolean = true) => {
  const rows = Math.round(Math.sqrt(len));
  const cols = Math.ceil(len / rows);
  let [r, c] = isDesktop ? [rows, cols] : [cols, rows];
  return {
    matrix:
      len > 0
        ? [
            ...Array(r - 1)
              .fill(null)
              .map(() => Array(c).fill('X')),
            Array(len - (r - 1) * c).fill('X'),
          ]
        : [],
    dims: {r, c},
  };
};

const GridVideo: layoutComponent = ({renderData}) => {
  const {dispatch} = useRtc();
  let onLayout = (e: any) => {
    setDim([
      e.nativeEvent.layout.width,
      e.nativeEvent.layout.height,
      e.nativeEvent.layout.width > e.nativeEvent.layout.height,
    ]);
  };
  const [dim, setDim] = useState<[number, number, boolean]>([
    Dimensions.get('window').width,
    Dimensions.get('window').height,
    Dimensions.get('window').width > Dimensions.get('window').height,
  ]);
  const isDesktop = dim[0] > dim[1] + 100;

  let {matrix, dims} = useMemo(
    () => layout(renderData.length, isDesktop),
    [renderData.length, isDesktop],
  );

  const setPinnedLayout = useSetPinnedLayout();
  return (
    <View
      style={[style.full, {paddingHorizontal: isDesktop ? 50 : 0}]}
      onLayout={onLayout}>
      {matrix.map((r, ridx) => (
        <View style={style.gridRow} key={ridx}>
          {r.map((c, cidx) => (
            <Pressable
              onPress={() => {
                if (!(ridx === 0 && cidx === 0)) {
                  dispatch({
                    type: 'SwapVideo',
                    value: [renderData[ridx * dims.c + cidx]],
                  });
                }
                setPinnedLayout();
              }}
              style={{
                flex: isWebInternal() ? 1 / dims.c : 1,
                marginHorizontal: 'auto',
              }}
              key={cidx}>
              <View style={style.gridVideoContainerInner}>
                <RenderComponent uid={renderData[ridx * dims.c + cidx]} />
              </View>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
};

const style = StyleSheet.create({
  full: {
    flex: 1,
    // padding: 20,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 10,
  },
  gridVideoContainerInner: {
    // borderColor: '#fff',
    // borderWidth:2,
    // width: '100%',
    borderRadius: 15,
    flex: 1,
    overflow: 'hidden',
    // margin: 1,
    marginHorizontal: 10,
  },
  MicBackdrop: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginHorizontal: 10,
    marginRight: 20,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    display: 'flex',
    justifyContent: 'center',
  },
  MicIcon: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
  },
});
export default GridVideo;

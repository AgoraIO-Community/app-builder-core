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
import React, {useContext, useEffect, useState} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import {layoutProps} from '../../theme.json';
import {useLocalUid, useContent, useActiveSpeaker} from 'customization-api';
import RenderComponent from '../../src/pages/video-call/RenderComponent';
import IconButton from '../../src/atoms/IconButton';
import hexadecimalTransparency from '../../src/utils/hexadecimalTransparency';
import {BREAKPOINTS, isMobileUA} from '../../src/utils/common';
import {DispatchContext} from '../../agora-rn-uikit';
import {useCustomWrapper} from '../custom-context/CustomWrapper';
const {topPinned} = layoutProps;

const ActiveSpeakerLayout = ({renderData}) => {
  const {pinnedUid, defaultContent, activeUids} = useContent();
  const {hideSelfView} = useCustomWrapper();
  const [collapse, setCollapse] = useState(false);
  const localUid = useLocalUid();
  const {width} = useWindowDimensions();
  const isDesktop = width > BREAKPOINTS.xl;
  const isSidePinnedlayout = topPinned === true ? false : isDesktop; // if either explicity set to false or auto evaluation
  //const [maxUid, ...minUids] = renderData;
  const activeSpeaker = useActiveSpeaker();
  const {dispatch} = useContext(DispatchContext);

  const [maxUid, setMaxUid] = useState(0);

  // const [uids, setUids] = useState(renderData);

  const [screenShareOn, setScreenShareOn] = useState(false);

  const nonLocalUid = activeUids?.filter(i => i !== localUid);

  useEffect(() => {
    const maxUidToSet =
      pinnedUid ||
      (activeSpeaker && activeSpeaker !== localUid
        ? activeSpeaker
        : nonLocalUid[0]);
    console.log('debugging pinnedUid', pinnedUid);
    console.log('debugging maxUidToSet', maxUidToSet);

    setMaxUid(maxUidToSet);
  }, [activeUids, pinnedUid, activeSpeaker]);

  useEffect(() => {
    if (hideSelfView && activeUids?.length === 2) {
      setCollapse(true);
    } else {
      setCollapse(false);
    }
  }, [hideSelfView, activeUids]);

  return (
    <View
      style={{
        flexDirection: isSidePinnedlayout ? 'row' : 'column',
        flex: 1,
      }}>
      {maxUid && (
        <View
          style={
            isSidePinnedlayout
              ? collapse
                ? style.width100
                : style.width80
              : style.flex8
          }>
          <View style={style.flex1} key={'maxVideo' + maxUid}>
            {isSidePinnedlayout && (
              <IconButton
                containerStyle={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  zIndex: 999,
                  elevation: 999,
                }}
                onPress={() => setCollapse(!collapse)}
                iconProps={{
                  iconContainerStyle: {
                    padding: 8,
                    backgroundColor:
                      $config.CARD_LAYER_5_COLOR +
                      hexadecimalTransparency['10%'],
                  },
                  name: collapse ? 'collapse' : 'expand',
                  tintColor: $config.SECONDARY_ACTION_COLOR,
                  iconSize: 24,
                }}
              />
            )}
            {pinnedUid ? (
              <IconButton
                containerStyle={{
                  paddingHorizontal: 8,
                  paddingVertical: 10,
                  backgroundColor: $config.VIDEO_AUDIO_TILE_OVERLAY_COLOR,
                  borderRadius: 8,
                  flexDirection: 'row',
                  position: 'absolute',
                  top: 8,
                  left: 8 + (isSidePinnedlayout ? 32 + 12 + 8 : 0),
                  zIndex: 999,
                  elevation: 999,
                }}
                iconProps={{
                  iconType: 'plain',
                  iconContainerStyle: {
                    padding: 0,
                  },
                  name: 'unpin-filled',
                  iconSize: 20,
                  tintColor: $config.VIDEO_AUDIO_TILE_TEXT_COLOR,
                }}
                onPress={() => {
                  dispatch({type: 'UserPin', value: [0]});
                }}
                btnTextProps={{
                  text: 'Unpin',
                  textColor: $config.VIDEO_AUDIO_TILE_TEXT_COLOR,
                  textStyle: {
                    marginTop: 0,
                    marginLeft: 6,
                    marginRight: 2,
                    fontWeight: '700',
                  },
                }}
              />
            ) : (
              <></>
            )}
            {/** Render the maximized view */}
            <RenderComponent uid={maxUid} isMax={true} />
          </View>
        </View>
      )}
      {!collapse && (
        <ScrollView
          horizontal={!isSidePinnedlayout}
          showsHorizontalScrollIndicator={isMobileUA() ? false : true}
          decelerationRate={0}
          style={
            isSidePinnedlayout
              ? {
                  width: '20%',
                  paddingRight: 8,
                }
              : {
                  flex: 1,
                  minHeight: 160,
                  marginBottom: 8,
                }
          }>
          {/* first item is for local user */}
          {!hideSelfView ? (
            <Pressable
              disabled={true}
              style={
                isSidePinnedlayout
                  ? {
                      width: '100%',
                      height: width * 0.1125 + 2, // width * 20/100 * 9/16 + 2
                      zIndex: 40,
                      paddingBottom: 8,
                    }
                  : {
                      // width: ((height / 3) * 16) / 9 / 2 + 12, //dim[1] /4.3
                      width: 254,
                      height: '100%',
                      zIndex: 40,
                      marginRight: 8,
                    }
              }
              key={'minVideo' + localUid}
              onPress={() => {
                dispatch({type: 'SwapVideo', value: [localUid]});
              }}>
              <RenderComponent uid={localUid} />
            </Pressable>
          ) : (
            <></>
          )}
          {/* Pinned Video Top View(Desktop minimized and Mobile native and Mobile web) / Side View(Desktop maximized)*/}
          {activeUids?.map((minUid, i) => {
            //first item -> maximized view so returning null
            if (minUid == localUid || maxUid == minUid) return null;
            //remaining items -> minimized view
            {
              /**Rendering minimized views */
            }
            return (
              <Pressable
                disabled={true}
                style={
                  isSidePinnedlayout
                    ? {
                        width: '100%',
                        height: width * 0.1125 + 2, // width * 20/100 * 9/16 + 2
                        zIndex: 40,
                        paddingBottom: 8,
                      }
                    : {
                        // width: ((height / 3) * 16) / 9 / 2 + 12, //dim[1] /4.3
                        width: 254,
                        height: '100%',
                        zIndex: 40,
                        marginRight: 8,
                      }
                }
                key={'minVideo' + i}
                onPress={() => {
                  dispatch({type: 'SwapVideo', value: [minUid]});
                }}>
                <RenderComponent uid={minUid} />
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  width80: {width: '80%'},
  width100: {width: '100%'},
  flex2: {flex: 2},
  flex8: {flex: 8},
  flex1: {flex: 1},
});

export default ActiveSpeakerLayout;

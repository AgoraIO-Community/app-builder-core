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
import React, {useState} from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Pressable,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import {layoutProps} from '../../theme.json';
import {layoutComponent, useRender, useRtc} from 'customization-api';
import RenderComponent from '../pages/video-call/RenderComponent';
import IconButton from '../atoms/IconButton';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {BREAKPOINTS, isMobileUA, useIsDesktop} from '../utils/common';
const {topPinned} = layoutProps;

const PinnedVideo: layoutComponent = ({renderData}) => {
  const {pinnedUid} = useRender();
  const [collapse, setCollapse] = useState(false);
  const {width, height} = useWindowDimensions();
  const isDesktop = width > BREAKPOINTS.xl;
  const isSidePinnedlayout = topPinned === true ? false : isDesktop; // if either explicity set to false or auto evaluation
  const [maxUid, ...minUids] = renderData;
  const {dispatch} = useRtc();

  // item render fn for Flatlist
  const rendeOtherParticipants = ({item}) => {
    const minUid = item;
    if (minUid !== pinnedUid) {
      return (
        <Pressable
          style={
            isSidePinnedlayout
              ? {
                  width: '100%',
                  height: width * 0.1125 + 2, // width * 20/100 * 9/16 + 2
                  zIndex: 40,
                  paddingBottom: 8,
                }
              : {
                  width: ((height / 3) * 16) / 9 / 2 + 12, //dim[1] /4.3
                  height: '100%',
                  zIndex: 40,
                  paddingRight: 8,
                  paddingVertical: 4,
                }
          }
          key={'minVideo' + minUid}
          onPress={() => {
            dispatch({type: 'SwapVideo', value: [minUid]});
          }}>
          <RenderComponent uid={minUid} />
        </Pressable>
      );
    }
  };

  return (
    <View
      style={{
        flexDirection: isSidePinnedlayout ? 'row' : 'column',
        flex: 1,
      }}>
      {!collapse && (
        <ScrollView
          horizontal={!isSidePinnedlayout}
          showsHorizontalScrollIndicator={false}
          decelerationRate={0}
          style={
            isSidePinnedlayout
              ? {
                  width: '20%',
                  paddingRight: 8,
                }
              : {flex: 1, minHeight: 108}
          }>
          {pinnedUid && pinnedUid !== maxUid ? (
            <Pressable
              disabled={renderData?.length === 1}
              style={
                isSidePinnedlayout
                  ? {
                      width: '100%',
                      height: width * 0.1125 + 2, // width * 20/100 * 9/16 + 2
                      zIndex: 40,
                      paddingBottom: 8,
                    }
                  : {
                      width: ((height / 3) * 16) / 9 / 2 + 12, //dim[1] /4.3
                      height: '100%',
                      zIndex: 40,
                      paddingRight: 8,
                      paddingVertical: 4,
                    }
              }
              key={'minVideo' + maxUid}
              onPress={() => {
                dispatch({type: 'SwapVideo', value: [maxUid]});
              }}>
              <RenderComponent uid={maxUid} />
            </Pressable>
          ) : (
            <></>
          )}

          {/* Renders Rest of Participants in Side/Top */}
          {/* FlatList is not udpating content as  orenderData is always same when pinned view
          https://stackoverflow.com/questions/43397803/how-to-re-render-flatlist
          */}
          {/* <FlatList
            horizontal={!isSidePinnedlayout}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            data={minUids}
            keyExtractor={(id) => id.toString()}
            renderItem={rendeOtherParticipants}
          /> */}

          {/* Pinned Video Top / Side */}

          {minUids
            .filter((i) => i !== pinnedUid)
            .map((minUid, i) => (
              <Pressable
                style={
                  isSidePinnedlayout
                    ? {
                        width: '100%',
                        height: width * 0.1125 + 2, // width * 20/100 * 9/16 + 2
                        zIndex: 40,
                        paddingBottom: 8,
                      }
                    : {
                        width: ((height / 3) * 16) / 9 / 2 + 12, //dim[1] /4.3
                        height: '100%',
                        zIndex: 40,
                        paddingRight: 8,
                        paddingVertical: 4,
                      }
                }
                key={'minVideo' + i}
                onPress={() => {
                  dispatch({type: 'SwapVideo', value: [minUid]});
                }}>
                <RenderComponent uid={minUid} />
              </Pressable>
            ))}
        </ScrollView>
      )}
      <View
        style={
          isSidePinnedlayout
            ? collapse
              ? style.width100
              : style.width80
            : style.flex4
        }>
        <View style={style.flex1} key={'maxVideo' + maxUid}>
          {isSidePinnedlayout && (
            <IconButton
              containerStyle={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 999,
                elevation: 1000,
              }}
              onPress={() => setCollapse(!collapse)}
              iconProps={{
                iconContainerStyle: {
                  padding: 8,
                  backgroundColor:
                    $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['10%'],
                },
                name: collapse ? 'collapse' : 'expand',
                tintColor: $config.VIDEO_AUDIO_TILE_TEXT_COLOR,
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
                top: 12,
                left: 12 + (isSidePinnedlayout ? 32 + 12 + 12 : 0),
                zIndex: 999,
                elevation: 1000,
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
                textStyle: {marginTop: 0, marginLeft: 6, fontWeight: '700'},
              }}
            />
          ) : (
            <></>
          )}
          {/* Renders Pinned User */}
          {pinnedUid ? (
            <RenderComponent uid={pinnedUid} isMax={true} />
          ) : (
            <RenderComponent uid={maxUid} isMax={true} />
          )}
        </View>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  width80: {width: '80%'},
  width100: {width: '100%'},
  flex2: {flex: 2},
  flex4: {flex: 4},
  flex1: {flex: 1},
});

export default PinnedVideo;

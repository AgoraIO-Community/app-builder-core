import React, {useContext, useState} from 'react';
import {
  View,
  Image,
  Text,
  Pressable,
  Platform,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {useString} from '../utils/useString';
import {networkIconsObject} from '../components/NetworkQualityContext';
//import {NetworkQualities} from 'src/language/default-labels/videoCallScreenLabels';
import {isMobileUA, isWebInternal} from '../utils/common';
import NetworkQualityContext from '../components/NetworkQualityContext';
import {RenderInterface, UidType} from '../../agora-rn-uikit';
import ThemeConfig from '../theme';
import ImageIcon from '../atoms/ImageIcon';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';
import {useLayout, useRender} from 'customization-api';
import {getGridLayoutName} from '../pages/video-call/DefaultLayouts';

/**
 *
 * @param networkStat - Network quality stat [ 0 - 8 ]
 * @param primaryColor - Primary color of the project
 * @param small - Reduced fontsize for pinned view min user panel
 * @param rootStyle - CSS style override primarily used for custom placement
 * @returns This component display overlay network quality indicator with an icon that expands on
 * hover to show network quality text [ ex. Excellent, Good, Bad etc ]
 *
 */
interface NetworkQualityPillProps {
  user: RenderInterface;
}
const NetworkQualityPill = (props: NetworkQualityPillProps) => {
  const {user} = props;
  const [networkTextVisible, setNetworkTextVisible] = useState(false);
  //commented for v1 release
  //const getLabel = useString<NetworkQualities>('networkQualityLabel');
  const getLabel = (quality: string) => {
    switch (quality) {
      case 'unknown':
        return 'Network Unsupported';
      case 'excellent':
        return 'Excellent Network';
      case 'good':
        return 'Good Network';
      case 'bad':
        return 'Bad Network';
      case 'veryBad':
        return 'Very Bad Network';
      case 'unpublished':
        return 'Network Unpublished';
      case 'loading':
        return 'Network Loading';
      default:
        return 'Loading';
    }
  };
  const networkQualityStat = useContext(NetworkQualityContext);
  const networkStat = networkQualityStat[user.uid]
    ? networkQualityStat[user.uid]
    : user.audio || user.video
    ? 8
    : 7;
  const {activeUids} = useRender();
  const {currentLayout} = useLayout();
  const reduceSpace =
    isMobileUA() &&
    activeUids.length > 4 &&
    currentLayout === getGridLayoutName();
  return (
    <View
      testID="videocall-networkpill"
      style={[
        style.networkPill,
        style.rootStyle,
        {
          backgroundColor: networkTextVisible
            ? networkIconsObject[networkStat].tint +
              hexadecimalTransparency['50%']
            : $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['10%'],
        },
        reduceSpace ? {top: 2, right: 2} : {},
      ]}>
      <PlatformSpecificWrapper
        {...{
          networkTextVisible,
          setNetworkTextVisible,
          reduceSpace,
          activeUids,
        }}>
        <View>
          <ImageIcon
            iconType="plain"
            tintColor={
              networkTextVisible
                ? $config.PRIMARY_ACTION_TEXT_COLOR
                : networkIconsObject[networkStat].tint +
                  hexadecimalTransparency['30%']
            }
            name={networkIconsObject[networkStat].icon}
            iconSize={16}
          />
        </View>
        {networkTextVisible && (
          <Text textBreakStrategy={'simple'} style={style.networkPillText}>
            {getLabel(networkIconsObject[networkStat].text)}
          </Text>
        )}
      </PlatformSpecificWrapper>
    </View>
  );
};

const PlatformSpecificWrapper = ({
  networkTextVisible,
  setNetworkTextVisible,
  children,
  reduceSpace,
  activeUids,
}: any) => {
  return !isWebInternal() ? (
    <Pressable
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: reduceSpace && activeUids.length > 12 ? 2 : 8,
      }}
      onPress={() => {
        setNetworkTextVisible((visible: boolean) => !visible);
      }}>
      {children}
    </Pressable>
  ) : (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: reduceSpace && activeUids.length > 12 ? 2 : 8,
      }}
      onClick={(e) => {
        e.preventDefault();
        setNetworkTextVisible((visible: boolean) => !visible);
      }}
      onMouseEnter={() => {
        setNetworkTextVisible(true);
      }}
      onMouseLeave={() => {
        setNetworkTextVisible(false);
      }}>
      {children}
    </div>
  );
};

const style = StyleSheet.create({
  networkPill: {
    position: 'absolute',
    zIndex: 2,
    borderRadius: 50,
  },
  rootStyle: {
    top: 8,
    right: 8,
  },
  networkPillContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkPillText: {
    color: $config.VIDEO_AUDIO_TILE_TEXT_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default NetworkQualityPill;

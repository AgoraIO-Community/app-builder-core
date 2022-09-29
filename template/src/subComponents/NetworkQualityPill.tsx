// @ts-nocheck
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
import {NetworkQualities} from 'src/language/default-labels/videoCallScreenLabels';
import {isWebInternal} from '../utils/common';
import NetworkQualityContext from '../components/NetworkQualityContext';
import {RenderInterface, UidType} from '../../agora-rn-uikit';

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
  primaryColor: any;
  small?: boolean;
  rootStyle?: StyleProp<ViewStyle>;
}
const NetworkQualityPill = (props: NetworkQualityPillProps) => {
  const {user, primaryColor, small, rootStyle} = props;
  const [networkTextVisible, setNetworkTextVisible] = useState(false);
  //commented for v1 release
  //const getLabel = useString<NetworkQualities>('networkQualityLabel');
  const getLabel = (quality: string) => {
    switch (quality) {
      case 'unknown':
        return 'Unknown';
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'bad':
        return 'Bad';
      case 'veryBad':
        return 'Very Bad';
      case 'unpublished':
        return 'Unpublished';
      case 'loading':
        return 'Loading';
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

  return (
    <View
      style={[
        style.networkPill,
        {
          opacity: networkTextVisible ? 1 : 0.8,
        },
        rootStyle,
      ]}>
      <PlatformSpecificWrapper {...{networkTextVisible, setNetworkTextVisible}}>
        <View style={[style.networkIndicatorBackdrop]}>
          <Image
            source={{
              uri: networkIconsObject[networkStat].icon,
            }}
            style={[
              style.networkIcon,
              {
                tintColor:
                  networkIconsObject[networkStat].tint === 'primary'
                    ? primaryColor
                    : networkIconsObject[networkStat].tint,
              },
            ]}
            resizeMode={'contain'}
          />
        </View>
        {networkTextVisible && (
          <Text
            textBreakStrategy={'simple'}
            style={[
              style.networkPillText,
              {fontSize: small ? 14 : 15, userSelect: 'none'},
            ]}>
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
}: any) => {
  return !isWebInternal() ? (
    <Pressable
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
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
    height: 30,
    backgroundColor: $config.SECONDARY_FONT_COLOR + 'bb',
    position: 'absolute',
    zIndex: 2,
    paddingHorizontal: 0,
    borderRadius: 15,
  },
  networkPillContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkPillText: {
    color: $config.PRIMARY_FONT_COLOR,
    lineHeight: 30,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 5,
    marginRight: 15,
  },
  networkIcon: {
    width: '80%',
    height: '80%',
    alignSelf: 'center',
  },
  networkIndicatorBackdrop: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: $config.SECONDARY_FONT_COLOR,
    justifyContent: 'center',
  },
});

export default NetworkQualityPill;

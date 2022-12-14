import RNTooltip from 'react-native-walkthrough-tooltip';
import React, {useState} from 'react';
import {Text, View, ViewStyle} from 'react-native';
import ThemeConfig from '../theme';
import hexadecimalTransparency from '../utils/hexadecimalTransparency';

interface TooltipProps {
  activeBgStyle?: ViewStyle;
  defaultBgStyle?: ViewStyle;
  renderContent: (
    isToolTipVisible: boolean,
    setToolTipVisible: React.Dispatch<React.SetStateAction<boolean>>,
  ) => React.ReactNode;
  toolTipMessage: string;
  toolTipIcon?: React.ReactNode;
}
const Tooltip = (props: TooltipProps) => {
  const [isToolTipVisible, setToolTipVisible] = useState(false);
  return (
    <RNTooltip
      arrowSize={{width: 25, height: 15}}
      contentStyle={{
        borderRadius: 8,
        padding: 12,
        backgroundColor: $config.CARD_LAYER_3_COLOR,
      }}
      tooltipStyle={{
        shadowColor:
          $config.HARD_CODED_BLACK_COLOR + hexadecimalTransparency['10%'],
        shadowOffset: {
          height: 4,
          width: 0,
        },
        shadowOpacity: 0.1,
        elevation: 5,
        shadowRadius: 2,
      }}
      backgroundColor={'transparent'}
      isVisible={isToolTipVisible}
      content={
        <View style={{flex: 1, flexDirection: 'row'}}>
          {props?.toolTipIcon ? props.toolTipIcon : <></>}
          <Text
            style={{
              color: $config.FONT_COLOR,
              fontFamily: ThemeConfig.FontFamily.sansPro,
              fontSize: 16,
              fontWeight: '400',
            }}>
            {props.toolTipMessage}
          </Text>
        </View>
      }
      placement="top"
      onClose={() => setToolTipVisible(false)}>
      <View
        style={isToolTipVisible ? props?.activeBgStyle : props?.defaultBgStyle}>
        {props.renderContent(isToolTipVisible, setToolTipVisible)}
      </View>
    </RNTooltip>
  );
};
export default Tooltip;

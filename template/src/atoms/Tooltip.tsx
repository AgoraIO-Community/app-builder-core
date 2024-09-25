import ReactTooltip from 'react-tooltip';
import React, {useState} from 'react';
import {Text, View, ViewStyle} from 'react-native';

interface TooltipProps {
  activeBgStyle?: ViewStyle;
  defaultBgStyle?: ViewStyle;
  rootTooltipContainer?: React.CSSProperties;
  containerStyle?: string;
  renderContent: (
    isToolTipVisible: boolean,
    setToolTipVisible: React.Dispatch<React.SetStateAction<boolean>>,
  ) => React.ReactNode;
  toolTipMessage: string | React.ReactNode;
  toolTipIcon?: React.ReactNode;
  isClickable?: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showTooltipArrow?: boolean;
  fontSize?: number;
  onPress?: () => void;
  disabled?: boolean;
  scrollY?: number;
}
const Tooltip = (props: TooltipProps) => {
  const [isToolTipVisible, setToolTipVisible] = useState(false);
  const {
    isClickable = false,
    placement = 'top',
    showTooltipArrow = true,
    rootTooltipContainer = {},
    disabled = false,
    containerStyle = '',
    scrollY = 0,
  } = props;
  const css = showTooltipArrow
    ? `
  .custom-tool-tip{
    padding:8px;
    border-radius: 8px;
    ${containerStyle}
  }
  .custom-tool-tip div{
    font-family: "Source Sans Pro";
    font-weight: 400;
    font-size: ${props.fontSize ? props.fontSize : 16}px;
    
  }
  .__react_component_tooltip.show{
    opacity:1;
  }
 `
    : `.custom-tool-tip {
        padding:8px;
        border-radius: 8px;
      }
  .custom-tool-tip div{
    font-family: "Source Sans Pro";
    font-weight: 400;
    font-size: ${props.fontSize ? props.fontSize : 16}px;
  }
  .__react_component_tooltip.show{
    opacity:1;
  }
  .custom-tool-tip::after{
    display:none
  }
`;
  const randomString = (
    length = 5,
    chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ) => {
    var result = '';
    for (var i = length; i > 0; --i)
      result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  };

  const toolTipId = randomString();

  return (
    <>
      <div
        style={{
          cursor: isClickable ? 'pointer' : 'auto',
          ...rootTooltipContainer,
        }}
        data-tip
        data-event={isClickable ? 'click focus' : 'mouseenter'}
        data-event-off={isClickable ? '' : 'mouseleave'}
        data-for={toolTipId}
        onMouseEnter={() => setToolTipVisible(true)}
        onMouseLeave={() => {
          setToolTipVisible(false);
        }}>
        <View
          style={
            isToolTipVisible ? props?.activeBgStyle : props?.defaultBgStyle
          }>
          {props.renderContent(isToolTipVisible, setToolTipVisible)}
        </View>
      </div>
      <ReactTooltip
        afterShow={() => {
          isClickable && props?.onPress && props.onPress();
        }}
        disable={disabled}
        globalEventOff="click"
        id={toolTipId}
        backgroundColor={$config.CARD_LAYER_3_COLOR}
        className="custom-tool-tip"
        place={placement}
        type="dark"
        effect="solid"
        overridePosition={({left, top}, currentEvent, currentTarget, node) => {
          const d = document.documentElement;
          left = Math.min(d.clientWidth - node.clientWidth, left);
          top = Math.min(d.clientHeight - node.clientHeight, top);
          left = Math.max(0, left);
          top = Math.max(0, top);
          return {top: top + scrollY, left};
        }}>
        <style type="text/css">{css}</style>
        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
          {props?.toolTipIcon ? props.toolTipIcon : null}
          <Text style={{color: $config.FONT_COLOR}}>
            {props.toolTipMessage}
          </Text>
        </View>
      </ReactTooltip>
    </>
  );
};
export default Tooltip;

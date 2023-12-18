import * as React from 'react';
//import './StrokeWidthTool.less';
import {Color, Room, RoomState} from 'white-web-sdk';
//import mask from './image/mask.svg';

export type StrokeWidthToolProps = {
  room: Room;
  roomState: RoomState;
};

export type StrokeWidthToolStates = {
  percentage: number;
};

const css = `
.tool-box-stroke-box {
  width: 170px;
  height: 30px;
}

.tool-box-input-box {
  width: 170px;
  height: 30px;
  position: absolute;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.palette-stroke-slider {
  width: 156px;
  outline: none;
  margin: 0;
  padding: 0;
  background: none;
}

input[type=range] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 8px;
  height: 24px;
  background: white;
  border-style: solid;
  border-color: #bdc1c9;
  border-width: 1px;
  cursor: pointer;
}

.tool-box-mask-box {
  width: 170px;
  height: 30px;
  position: absolute;
  z-index: 4;

  img {
    user-select: none;
  }
  svg {
    user-select: none;
  }
}

.tool-box-under-box-2 {
  width: 156px;
  height: 26px;
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  margin-top: 2px;
  margin-left: 6px;
}

.tool-box-under-box {
  width: 170px;
  height: 26px;
  position: absolute;
  z-index: 0;
  display: flex;
  align-items: center;
  background-color: #E7E7E7;
  margin-top: 2px;
}

`;

export default class StrokeWidthTool extends React.PureComponent<
  StrokeWidthToolProps,
  StrokeWidthToolStates
> {
  public constructor(props: StrokeWidthToolProps) {
    super(props);
    this.state = {
      percentage: props.room.state.memberState.strokeWidth / 32,
    };
  }

  private rgbToHex = (rgb: Color): string => {
    return (
      '#' +
      this.componentToHex(rgb[0]) +
      this.componentToHex(rgb[1]) +
      this.componentToHex(rgb[2])
    );
  };

  private setStrokeWidth = (event: any): void => {
    const {room} = this.props;
    const percentage = event.target.value / 32;
    const strokeWidth = parseInt(event.target.value);
    this.setState({percentage: percentage});
    room.setMemberState({strokeWidth: strokeWidth});
  };

  private componentToHex = (c: number): string => {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  };

  public render(): React.ReactNode {
    const {room, roomState} = this.props;
    const strokeColor = room.state.memberState.strokeColor;
    return (
      <>
        <style type="text/css">{css}</style>
        <div className="tool-box-stroke-box">
          <div className="tool-box-input-box">
            <input
              className="palette-stroke-slider"
              type="range"
              min={1}
              max={32}
              onChange={this.setStrokeWidth}
              defaultValue={roomState.memberState.strokeWidth}
              onMouseUp={() =>
                room.setMemberState({
                  strokeWidth: roomState.memberState.strokeWidth,
                })
              }
            />
          </div>
          <div className="tool-box-mask-box">
            {/* <img src={mask} alt={'mask'} /> */}
            <svg
              width="170px"
              height="29px"
              viewBox="0 0 170 29"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg">
              <title>mask (1)</title>
              <desc>Created with Sketch.</desc>
              <g
                id="页面1"
                stroke="none"
                stroke-width="1"
                fill="none"
                fill-rule="evenodd">
                <g
                  id="mask-(1)"
                  transform="translate(0.000000, -0.177515)"
                  fill="#FFFFFF"
                  fill-rule="nonzero">
                  <path
                    d="M170,0.177514793 L170,29.1775148 L0,29.1775148 L0,0.177514793 L170,0.177514793 Z M155.702875,7.70508717 L155.434123,7.71050163 L8.49907471,13.4220166 C7.82142679,13.4483583 7.28571429,14.0026739 7.28571429,14.6775148 C7.28571429,15.3523557 7.82142679,15.9066713 8.49907471,15.933013 L8.49907471,15.933013 L155.434123,21.644528 C155.525243,21.6480696 155.616424,21.649841 155.707613,21.649841 C159.577292,21.649841 162.714286,18.5282242 162.714286,14.6775148 C162.714286,14.5867726 162.712506,14.4960388 162.708947,14.4053655 C162.557902,10.5575911 159.300853,7.56019825 155.434123,7.71050163 L155.702875,7.70508717 Z"
                    id="mask"></path>
                </g>
              </g>
            </svg>
          </div>
          <div
            className="tool-box-under-box-2"
            style={{
              width: 156 * this.state.percentage,
              backgroundColor: this.rgbToHex(strokeColor),
            }}
          />
          <div className="tool-box-under-box" />
        </div>
      </>
    );
  }
}

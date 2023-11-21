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

import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Pressable} from 'react-native';
import {isMobileUA} from '../../utils/common';
import {ApplianceNames} from 'white-web-sdk';

const WhiteboardToolBox = ({whiteboardRoom}) => {
  const [selectedTool, setSelectedTool] = useState(ApplianceNames.pencil);

  useEffect(() => {
    whiteboardRoom.current?.setMemberState({
      strokeColor: [0, 0, 0],
    });
  }, [whiteboardRoom]);

  const handleSelect = (applicanceName: ApplianceNames) => {
    setSelectedTool(applicanceName);
    whiteboardRoom.current?.setMemberState({
      currentApplianceName: applicanceName,
      strokeColor: [0, 0, 0],
    });
  };

  const handleClear = () => {
    whiteboardRoom.current?.cleanCurrentScene();
  };

  return (
    <View
      style={
        isMobileUA() ? style.toolboxContainerMobile : style.toolboxContainer
      }>
      <View style={style.toolbox} nativeID="toolbox">
        <Pressable
          style={
            selectedTool === ApplianceNames.clicker
              ? style.toolActive
              : style.tool
          }
          onPress={() => {
            handleSelect(ApplianceNames.clicker);
          }}>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <title>clicker</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
              stroke-linecap="round"
              stroke-linejoin="round">
              <g id="编组-4" stroke="#444E60">
                <polygon
                  id="路径-5"
                  points="7 5.07179677 8.66987298 17.9641016 11.9090909 13.5745916 17.330127 12.9641016"></polygon>
                <line
                  x1="12"
                  y1="13.7320508"
                  x2="15"
                  y2="18.9282032"
                  id="路径-7"></line>
                <polygon
                  id="路径-5"
                  points="7 5.07179677 8.66987298 17.9641016 11.9090909 13.5745916 17.330127 12.9641016"></polygon>
                <line
                  x1="12"
                  y1="13.7320508"
                  x2="15"
                  y2="18.9282032"
                  id="路径-7"></line>
              </g>
            </g>
          </svg>
        </Pressable>
        <Pressable
          style={
            selectedTool === ApplianceNames.selector
              ? style.toolActive
              : style.tool
          }
          onPress={() => {
            handleSelect(ApplianceNames.selector);
          }}>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <title>Select</title>
            <g
              id="Flat"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd">
              <g
                id="白板-关闭摄像头-大班课"
                transform="translate(-16.000000, -247.000000)">
                <g id="编组-35" transform="translate(8.000000, 207.000000)">
                  <g id="folder备份" transform="translate(8.000000, 40.000000)">
                    <path
                      d="M12,19 L7,19 C5.8954305,19 5,18.1045695 5,17 L5,7 C5,5.8954305 5.8954305,5 7,5 L17,5 C18.1045695,5 19,5.8954305 19,7 L19,12 L19,12"
                      id="路径"
                      stroke="#444E60"
                      stroke-linecap="round"
                      stroke-linejoin="round"></path>
                    <polygon
                      id="路径-10"
                      fill="#444E60"
                      points="13 13 19 15 16.3333333 16.3333333 15 19"></polygon>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </Pressable>
        <Pressable
          style={
            selectedTool === ApplianceNames.hand ? style.toolActive : style.tool
          }
          onPress={() => {
            handleSelect(ApplianceNames.hand);
          }}>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <title>Hand</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
              stroke-linecap="round"
              stroke-linejoin="round">
              <g
                id="切图"
                transform="translate(-8.000000, -224.000000)"
                stroke="#444E60">
                <g id="编组备份" transform="translate(8.000000, 224.000000)">
                  <path
                    d="M12.5,5 C13.0522847,5 13.5,5.44771525 13.5,6 L13.5,7 C13.5,6.44771525 13.9477153,6 14.5,6 C15.0522847,6 15.5,6.44771525 15.5,7 L15.5,7 L15.5,9 C15.5,8.44771525 15.9477153,8 16.5,8 C17.0522847,8 17.5,8.44771525 17.5,9 L17.5,9 L17.5,15 C17.5,17.209139 15.709139,19 13.5,19 L12.1375846,19 C10.5374722,19 9.09131968,18.0464126 8.46100451,16.5756772 L6.77854301,12.6499337 C6.61031263,12.2573961 6.69801722,11.8019828 7,11.5 C7.27614237,11.2238576 7.72385763,11.2238576 8,11.5 L9.5,13 L9.5,7 L9.50672773,6.88337887 C9.56449284,6.38604019 9.98716416,6 10.5,6 C11.0522847,6 11.5,6.44771525 11.5,7 L11.5,7 L11.5,6 C11.5,5.44771525 11.9477153,5 12.5,5 Z M11.5,6 L11.5,10 M13.5,6 L13.5,10 M15.5,8 L15.5,10"
                    id="形状结合备份"
                    transform="translate(12.000000, 12.000000) rotate(45.000000) translate(-12.000000, -12.000000) "></path>
                </g>
              </g>
            </g>
          </svg>
        </Pressable>
        <Pressable
          style={
            selectedTool === ApplianceNames.pencil
              ? style.toolActive
              : style.tool
          }
          onPress={() => {
            handleSelect(ApplianceNames.pencil);
          }}>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <title>Pencil</title>
            <g
              id=""
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
              stroke-linecap="round"
              stroke-linejoin="round">
              <g
                id="pencil"
                transform="translate(-8.000000, -44.000000)"
                stroke="#444E60">
                <g id="folder备份" transform="translate(8.000000, 44.000000)">
                  <path
                    d="M15.2700286,11.5822879 L9.44305056,17.4092659 C9.06480988,17.7875066 8.55180543,18 8.01689232,18 L6,18 L6,18 L6,15.9831077 C6,15.4481946 6.2124934,14.9351901 6.59073408,14.5569494 L14.5569494,6.59073408 C15.3445949,5.80308864 16.6216205,5.80308864 17.4092659,6.59073408 C18.1969114,7.37837953 18.1969114,8.65540512 17.4092659,9.44305056 L17.4092659,9.44305056 L17.4092659,9.44305056 C18.1969114,10.230696 18.1969114,11.5077216 17.4092659,12.295367 L14.5569494,15.1476835 L14.5569494,15.1476835"
                    id="路径"></path>
                </g>
              </g>
            </g>
          </svg>
        </Pressable>
        <Pressable
          style={
            selectedTool === ApplianceNames.eraser
              ? style.toolActive
              : style.tool
          }
          onPress={() => {
            handleSelect(ApplianceNames.eraser);
          }}>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <title>Eraser</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd">
              <g
                id="切图"
                transform="translate(-8.000000, -116.000000)"
                stroke="#444E60">
                <g id="编组-3" transform="translate(8.000000, 116.000000)">
                  <line x1="11" y1="8" x2="16" y2="13" id="路径-26"></line>
                  <path
                    d="M15.5,6.16666667 L17.8333333,8.5 C18.4776655,9.14433221 18.4776655,10.1890011 17.8333333,10.8333333 L12,16.6666667 C10.7113356,17.9553311 8.62199775,17.9553311 7.33333333,16.6666667 L6.16666667,15.5 C5.52233446,14.8556678 5.52233446,13.8109989 6.16666667,13.1666667 L13.1666667,6.16666667 C13.8109989,5.52233446 14.8556678,5.52233446 15.5,6.16666667 Z"
                    id="矩形"
                    stroke-linecap="round"
                    stroke-linejoin="round"></path>
                </g>
              </g>
            </g>
          </svg>
        </Pressable>
        <Pressable
          style={
            selectedTool === ApplianceNames.arrow
              ? style.toolActive
              : style.tool
          }
          onPress={() => {
            handleSelect(ApplianceNames.arrow);
          }}>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <title>Arrow</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd">
              <g id="切图" transform="translate(-8.000000, -152.000000)">
                <g id="编组-4备份" transform="translate(8.000000, 152.000000)">
                  <line
                    x1="6"
                    y1="18"
                    x2="16.4593589"
                    y2="7.54064109"
                    id="路径-20"
                    stroke="#444E60"
                    stroke-linecap="square"
                    stroke-linejoin="round"></line>
                  <polygon
                    id="矩形"
                    fill="#444E60"
                    points="12 6 18 6 18 12"></polygon>
                </g>
              </g>
            </g>
          </svg>
        </Pressable>
        <Pressable
          style={
            selectedTool === ApplianceNames.laserPointer
              ? style.toolActive
              : style.tool
          }
          onPress={() => {
            handleSelect(ApplianceNames.laserPointer);
          }}>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <title>Laser Pointer</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd">
              <g id="切图" transform="translate(-8.000000, -188.000000)">
                <g id="编组-3备份" transform="translate(8.000000, 188.000000)">
                  <circle
                    id="椭圆形"
                    fill="#444E60"
                    cx="12"
                    cy="12"
                    r="2"></circle>
                  <line
                    x1="12"
                    y1="4"
                    x2="12"
                    y2="6"
                    id="路径-4"
                    stroke="#444E60"
                    stroke-linecap="square"
                    stroke-linejoin="round"></line>
                  <line
                    x1="12"
                    y1="18"
                    x2="12"
                    y2="20"
                    id="路径-4备份"
                    stroke="#444E60"
                    stroke-linecap="square"
                    stroke-linejoin="round"></line>
                  <line
                    x1="20"
                    y1="12"
                    x2="18"
                    y2="12"
                    id="路径-4"
                    stroke="#444E60"
                    stroke-linecap="square"
                    stroke-linejoin="round"></line>
                  <line
                    x1="6"
                    y1="12"
                    x2="4"
                    y2="12"
                    id="路径-4备份"
                    stroke="#444E60"
                    stroke-linecap="square"
                    stroke-linejoin="round"></line>
                  <line
                    x1="17.6568542"
                    y1="17.6568542"
                    x2="16.2426407"
                    y2="16.2426407"
                    id="路径-4"
                    stroke="#444E60"
                    stroke-linecap="square"
                    stroke-linejoin="round"></line>
                  <line
                    x1="7.75735931"
                    y1="7.75735931"
                    x2="6.34314575"
                    y2="6.34314575"
                    id="路径-4备份"
                    stroke="#444E60"
                    stroke-linecap="square"
                    stroke-linejoin="round"></line>
                  <line
                    x1="6.34314575"
                    y1="17.6568542"
                    x2="7.75735931"
                    y2="16.2426407"
                    id="路径-4"
                    stroke="#444E60"
                    stroke-linecap="square"
                    stroke-linejoin="round"></line>
                  <line
                    x1="16.2426407"
                    y1="7.75735931"
                    x2="17.6568542"
                    y2="6.34314575"
                    id="路径-4备份"
                    stroke="#444E60"
                    stroke-linecap="square"
                    stroke-linejoin="round"></line>
                </g>
              </g>
            </g>
          </svg>
        </Pressable>
        <Pressable
          style={
            selectedTool === ApplianceNames.straight
              ? style.toolActive
              : style.tool
          }
          onPress={() => {
            handleSelect(ApplianceNames.straight);
          }}>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <title>Straing line</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
              stroke-linecap="round"
              stroke-linejoin="round">
              <g
                id="切图"
                transform="translate(-8.000000, -404.000000)"
                stroke="#444E60">
                <g
                  id="folder备份-2"
                  transform="translate(8.000000, 404.000000)">
                  <line x1="6" y1="18" x2="18" y2="6" id="路径-2"></line>
                </g>
              </g>
            </g>
          </svg>
        </Pressable>
        <Pressable
          style={
            selectedTool === ApplianceNames.ellipse
              ? style.toolActive
              : style.tool
          }
          onPress={() => {
            handleSelect(ApplianceNames.ellipse);
          }}>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <title>Ellipse</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
              stroke-linejoin="round">
              <g
                id="切图"
                transform="translate(-8.000000, -368.000000)"
                stroke="#444E60">
                <g id="folder备份" transform="translate(8.000000, 368.000000)">
                  <rect
                    id="矩形"
                    x="6"
                    y="6"
                    width="12"
                    height="12"
                    rx="6"></rect>
                </g>
              </g>
            </g>
          </svg>
        </Pressable>
        <Pressable
          style={
            selectedTool === ApplianceNames.rectangle
              ? style.toolActive
              : style.tool
          }
          onPress={() => {
            handleSelect(ApplianceNames.rectangle);
          }}>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <title>Rectangle</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
              stroke-linejoin="round">
              <g
                id="切图"
                transform="translate(-8.000000, -332.000000)"
                stroke="#444E60">
                <g id="folder备份" transform="translate(8.000000, 332.000000)">
                  <rect
                    id="矩形"
                    x="6"
                    y="6"
                    width="12"
                    height="12"
                    rx="2"></rect>
                </g>
              </g>
            </g>
          </svg>
        </Pressable>
        <Pressable
          style={
            selectedTool === ApplianceNames.text ? style.toolActive : style.tool
          }
          onPress={() => {
            handleSelect(ApplianceNames.text);
          }}>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <title>Text</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
              stroke-linecap="round"
              stroke-linejoin="round">
              <g
                id="切图"
                transform="translate(-8.000000, -80.000000)"
                stroke="#444E60">
                <g id="编组-2" transform="translate(8.000000, 80.000000)">
                  <polyline id="路径-16" points="6 6 18 6 18 8"></polyline>
                  <line x1="12" y1="6" x2="12" y2="16" id="路径-17"></line>
                  <line x1="6" y1="6" x2="6" y2="8" id="路径-18"></line>
                  <line x1="10" y1="18" x2="14" y2="18" id="路径-19"></line>
                </g>
              </g>
            </g>
          </svg>
        </Pressable>
        <Pressable
          style={style.tool}
          onPress={() => {
            handleClear();
          }}>
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg">
            <title>Clear</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
              stroke-linecap="round"
              stroke-linejoin="round">
              <g
                id="小班课"
                transform="translate(-16.000000, -549.000000)"
                stroke="#444E60">
                <g id="编组-35" transform="translate(8.000000, 285.000000)">
                  <g id="编组-9" transform="translate(8.000000, 264.000000)">
                    <path
                      d="M10.6666667,9.66666667 L10.6666667,6.16666667 C10.6666667,5.52233446 11.1890011,5 11.8333333,5 C12.4776655,5 13,5.52233446 13,6.16666667 L13,9.66666667 L13,9.66666667 C14.2886644,9.66666667 15.3333333,10.7113356 15.3333333,12 L15.3333333,12 L15.3333333,12 L8.33333333,12 C8.33333333,10.7113356 9.37800225,9.66666667 10.6666667,9.66666667 L10.6666667,9.66666667 L10.6666667,9.66666667 Z"
                      id="路径-47"></path>
                    <path
                      d="M15.3333333,12 L17.6666667,17.8333333 C13.8159078,18.6034851 9.85075886,18.6034851 6,17.8333333 L8.33333333,12"
                      id="路径"></path>
                    <line
                      x1="11.8333333"
                      y1="17.8333333"
                      x2="11.8333333"
                      y2="15.5"
                      id="路径-49"></line>
                    <line
                      x1="9.5"
                      y1="17.8333333"
                      x2="9.5"
                      y2="15.5"
                      id="路径-51"></line>
                    <line
                      x1="14.1666667"
                      y1="17.8333333"
                      x2="14.1666667"
                      y2="15.5"
                      id="路径-52"></line>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </Pressable>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  toolboxContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  toolboxContainerMobile: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  toolbox: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginRight: 'auto',
    padding: 5,
    height: 320,
    width: 80,
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5.22,
    elevation: 10,
    zIndex: 10,
  },
  toolActive: {
    height: 30,
    width: 30,
    borderRadius: 20,
    padding: 3,
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderWidth: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tool: {
    height: 30,
    width: 30,
    borderRadius: 20,
    padding: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WhiteboardToolBox;

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
import {StyleSheet, View, Pressable} from 'react-native';
import {isMobileUA, isWeb, randomString} from '../../utils/common';
import {ApplianceNames} from 'white-web-sdk';
import StorageContext from '../../components/StorageContext';
import {useRoomInfo} from '../room-info/useRoomInfo';
import Toast from '../../../react-native-toast-message';
import {IconButton, whiteboardContext} from 'customization-api';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../../rtm-events-api/LocalEvents';

const supportedDocTypes = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/pdf',
];
const supportedImageType = ['image/png', 'image/jpeg'];
interface ColorPickerValues {
  [key: string]: {
    hex: string;
    rgb: [number, number, number];
  };
}
const ColorPickerValues: ColorPickerValues = {
  white: {
    hex: '#FFFFFF',
    rgb: [255, 255, 255],
  },
  lightGrey: {
    hex: '#666666',
    rgb: [102, 102, 102],
  },
  darkGrey: {
    hex: '#333333',
    rgb: [51, 51, 51],
  },
  black: {
    hex: '#000000',
    rgb: [0, 0, 0],
  },
  lightBlue: {
    hex: '#4689E3',
    rgb: [70, 137, 227],
  },
  green: {
    hex: '#428D57',
    rgb: [66, 141, 87],
  },
  lightYellow: {
    hex: '#EAC443',
    rgb: [234, 196, 67],
  },
  darkYellow: {
    hex: '#E99D3D',
    rgb: [233, 157, 61],
  },
  orange: {
    hex: '#CE4E29',
    rgb: [206, 78, 41],
  },
  red: {
    hex: '#CF130C',
    rgb: [207, 19, 12],
  },
  rose: {
    hex: '#EE3BDC',
    rgb: [238, 59, 220],
  },
  purple: {
    hex: '#843BEE',
    rgb: [132, 59, 238],
  },
};
//test image upload
const TEST_IMAGE_DATA = {
  '1': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/1/200/300',
  },
  '2': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/2/200/300',
  },
  '3': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/3/200/300',
  },
  '4': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/4/200/300',
  },
  '5': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/5/200/300',
  },
  '6': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/6/200/300',
  },
  '7': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/7/200/300',
  },
  '8': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/8/200/300',
  },
  '9': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/9/200/300',
  },
  '10': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/10/200/300',
  },
  '11': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/11/200/300',
  },
  '12': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/12/200/300',
  },
  '13': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/13/200/300',
  },
  '14': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/14/200/300',
  },
  '15': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/15/200/300',
  },
  '16': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/16/200/300',
  },
  '17': {
    width: 200,
    height: 300,
    url: 'https://picsum.photos/seed/17/200/300',
  },
};

const WhiteboardToolBox = ({whiteboardRoom}) => {
  const [selectedTool, setSelectedTool] = useState(ApplianceNames.pencil);
  const [showShapes, setShowShapes] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('black');
  const {
    data: {roomId},
  } = useRoomInfo();
  const {store} = useContext(StorageContext);
  const {setUploadRef, insertImageIntoWhiteboard} =
    useContext(whiteboardContext);
  const [isShapeBtnHovered, setShapeBtnHovered] = useState(false);
  const [isShapeContainerHovered, setShapeContainerHovered] = useState(false);
  const [isColorBtnHovered, setColorBtnHovered] = useState(false);
  const [isColorContainerHovered, setColorContainerHovered] = useState(false);
  const handleSelect = (applicanceName: ApplianceNames) => {
    setSelectedTool(applicanceName);
    whiteboardRoom.current?.setMemberState({
      currentApplianceName: applicanceName,
    });
  };

  const handleClear = () => {
    whiteboardRoom.current?.cleanCurrentScene();
  };

  const setCursorColor = (value: [number, number, number]) => {
    whiteboardRoom.current?.setMemberState({
      strokeColor: value,
    });
  };

  /**
   * After file upload and conversation, we will get list of image via RTM message
   * @param data
   * @param selectedFile
   */
  const fileUploadAndConvert = (data, selectedFile) => {
    if (data?.url) {
      const url = data?.url?.replaceAll('\u0026', '&');
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', selectedFile?.type);
      const requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: selectedFile,
      };
      fetch(url, requestOptions)
        .then(() => {
          const myHeaders2 = new Headers();
          myHeaders2.append('Content-Type', 'application/json');
          myHeaders2.append('Authorization', `Bearer ${store?.token}`);
          const body = JSON.stringify({
            resource_url: url,
            passphrase: roomId?.host,
            conversion_type: 'static',
            conversion_scale: 3,
          });
          fetch(`${$config.BACKEND_ENDPOINT}/v1/whiteboard/fileconvert`, {
            method: 'POST',
            headers: myHeaders2,
            body: body,
          })
            .then(res2 => {
              console.log('debugging file convert success', res2);
              //updating upload flag as true
              //once we got RTM message we will proceed to insert image into whiteboard
              setUploadRef();
            })
            .catch(err2 => {
              console.log('debugging file convert failed', err2);
              Toast.show({
                type: 'error',
                text1: 'Error on uploading file, please try again.',
                visibilityTime: 10000,
              });
            });
        })
        .catch(() => {
          Toast.show({
            type: 'error',
            text1: 'Error on uploading file, please try again.',
            visibilityTime: 10000,
          });
        });
    } else {
      console.log('debugging upload url is empty');
      Toast.show({
        type: 'error',
        text1: 'Error on uploading file, please try again.',
        visibilityTime: 10000,
      });
    }
  };

  /**
   * After image upload we need to call whiteboard/image url to for GET url for image
   * @param data
   * @param selectedFile
   */
  const imageUpload = (data, selectedFile) => {
    if (data?.url) {
      const url = data?.url?.replaceAll('\u0026', '&');
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', selectedFile?.type);
      const requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: selectedFile,
      };
      fetch(url, requestOptions)
        .then(() => {
          const myHeaders2 = new Headers();
          myHeaders2.append('Content-Type', 'application/json');
          myHeaders2.append('Authorization', `Bearer ${store?.token}`);
          const body = JSON.stringify({
            resource_url: url,
          });
          fetch(`${$config.BACKEND_ENDPOINT}/v1/whiteboard/image`, {
            method: 'POST',
            headers: myHeaders2,
            body: body,
          })
            .then(async res2 => {
              const jsonData = await res2.json();
              if (jsonData && jsonData?.url) {
                const imageUrl = jsonData?.url?.replaceAll('\u0026', '&');
                insertImageIntoWhiteboard(imageUrl);
              }
              console.log('debugging image upload success', res2);
            })
            .catch(err2 => {
              console.log('debugging error get image url', err2);
              Toast.show({
                type: 'error',
                text1: 'Error on uploading image, please try again.',
                visibilityTime: 10000,
              });
            });
        })
        .catch(() => {
          Toast.show({
            type: 'error',
            text1: 'Error on uploading image, please try again.',
            visibilityTime: 10000,
          });
        });
    } else {
      console.log('debugging image upload url is empty');
      Toast.show({
        type: 'error',
        text1: 'Error on uploading image, please try again.',
        visibilityTime: 10000,
      });
    }
  };

  const onFileChange = event => {
    try {
      const selectedFile = event.target.files[0];
      if (
        supportedDocTypes.indexOf(selectedFile?.type) !== -1 ||
        supportedImageType?.indexOf(selectedFile?.type) !== -1
      ) {
        /**
         * Get URL to upload the file
         */
        fetch(`${$config.BACKEND_ENDPOINT}/v1/whiteboard/upload`, {
          method: 'GET',
          headers: {
            authorization: store?.token ? `Bearer ${store?.token}` : '',
          },
        })
          .then(async res => {
            const data = await res.json();
            if (supportedImageType?.indexOf(selectedFile?.type) !== -1) {
              imageUpload(data, selectedFile);
            } else {
              fileUploadAndConvert(data, selectedFile);
            }
          })
          .catch(err => {
            console.log('debugging upload api failed', err);
            Toast.show({
              type: 'error',
              text1: 'Error on uploading file, please try again.',
              visibilityTime: 10000,
            });
          });
      } else {
        console.log('debugging unsupported file');
        Toast.show({
          type: 'error',
          text1: 'Unsupported file',
          text2:
            'Please select file format with pdf, doc, docx, ppt, pptx, png, jpg, jpeg',
          visibilityTime: 10000,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error on uploading file, please try again.',
        visibilityTime: 10000,
      });
    }
  };

  const renderShapesMenu = () => {
    return (
      <>
        {isShapeBtnHovered || isShapeContainerHovered ? (
          <div
            onMouseEnter={() => {
              setShapeContainerHovered(true);
            }}
            onMouseLeave={() => {
              setTimeout(() => {
                setShapeContainerHovered(false);
              }, 250);
            }}>
            <View style={style.toolboxShapesContainer}>
              <View style={style.toolboxNew}>
                <IconButton
                  onPress={() => {
                    handleSelect(ApplianceNames.rectangle);
                    setShowShapes(false);
                    setShapeContainerHovered(false);
                    setShapeBtnHovered(false);
                  }}
                  hoverEffect={true}
                  hoverEffectStyle={style.itemHoverStyle}
                  containerStyle={
                    selectedTool === ApplianceNames.rectangle
                      ? style.itemSelectedStyle
                      : style.itemDefaultStyle
                  }
                  iconProps={{
                    name: 'square',
                    iconSize: 24,
                    iconType: 'plain',
                    tintColor: $config.FONT_COLOR,
                  }}
                />
                <IconButton
                  onPress={() => {
                    handleSelect(ApplianceNames.ellipse);
                    setShowShapes(false);
                    setShapeContainerHovered(false);
                    setShapeBtnHovered(false);
                  }}
                  hoverEffect={true}
                  hoverEffectStyle={style.itemHoverStyle}
                  containerStyle={
                    selectedTool === ApplianceNames.ellipse
                      ? style.itemSelectedStyle
                      : style.itemDefaultStyle
                  }
                  iconProps={{
                    name: 'circle',
                    iconSize: 24,
                    iconType: 'plain',
                    tintColor: $config.FONT_COLOR,
                  }}
                />

                <IconButton
                  onPress={() => {
                    handleSelect(ApplianceNames.straight);
                    setShowShapes(false);
                    setShapeContainerHovered(false);
                    setShapeBtnHovered(false);
                  }}
                  hoverEffect={true}
                  hoverEffectStyle={style.itemHoverStyle}
                  containerStyle={
                    selectedTool === ApplianceNames.straight
                      ? style.itemSelectedStyle
                      : style.itemDefaultStyle
                  }
                  iconProps={{
                    name: 'line',
                    iconSize: 24,
                    iconType: 'plain',
                    tintColor: $config.FONT_COLOR,
                  }}
                />

                <IconButton
                  onPress={() => {
                    handleSelect(ApplianceNames.arrow);
                    setShowShapes(false);
                    setShapeContainerHovered(false);
                    setShapeBtnHovered(false);
                  }}
                  hoverEffect={true}
                  hoverEffectStyle={style.itemHoverStyle}
                  containerStyle={
                    selectedTool === ApplianceNames.arrow
                      ? style.itemSelectedStyle
                      : style.itemDefaultStyle
                  }
                  iconProps={{
                    name: 'arrow',
                    iconSize: 24,
                    iconType: 'plain',
                    tintColor: $config.FONT_COLOR,
                  }}
                />
              </View>
            </View>
          </div>
        ) : (
          <></>
        )}
      </>
    );
  };

  const renderColorMenu = () => {
    // if (!showColorPicker) {
    //   return null;
    // }

    if (isColorBtnHovered || isColorContainerHovered) {
      const renderItems = [];
      for (const key in ColorPickerValues) {
        if (Object.prototype.hasOwnProperty.call(ColorPickerValues, key)) {
          const element = ColorPickerValues[key];
          renderItems.push(
            <IconButton
              onPress={() => {
                setCursorColor(element.rgb);
                setSelectedColor(key);
                setShowColorPicker(false);
                setColorBtnHovered(false);
                setColorContainerHovered(false);
              }}
              hoverEffect={true}
              hoverEffectStyle={style.itemHoverStyle}
              containerStyle={
                selectedColor === key
                  ? style.itemSelectedStyle
                  : style.itemDefaultStyle
              }
              iconProps={{
                name: 'gradient',
                iconSize: 24,
                iconType: 'plain',
                tintColor: element.hex,
              }}
            />,
          );
        }
      }
      return (
        <div
          onMouseEnter={() => {
            setColorContainerHovered(true);
          }}
          onMouseLeave={() => {
            setTimeout(() => {
              setColorContainerHovered(false);
            }, 250);
          }}>
          <View style={style.toolboxColorsContainer}>
            <View style={style.toolboxNew}>{renderItems}</View>
          </View>
        </div>
      );
    }
    return null;
  };

  const testImageUpload = () => {
    setUploadRef();
    LocalEventEmitter.emit(
      LocalEventsEnum.WHITEBOARD_FILE_UPLOAD,
      TEST_IMAGE_DATA,
    );
  };

  return (
    <>
      {renderShapesMenu()}
      {renderColorMenu()}
      <View
        style={
          isMobileUA() ? style.toolboxContainerMobile : style.toolboxContainer
        }>
        <View style={style.toolboxNew} nativeID="toolbox">
          <IconButton
            toolTipMessage="Select"
            placement={'right'}
            showTooltipArrow={false}
            onPress={() => {
              handleSelect(ApplianceNames.clicker);
            }}
            hoverEffect={true}
            hoverEffectStyle={style.itemHoverStyle}
            containerStyle={
              selectedTool === ApplianceNames.clicker
                ? style.itemSelectedStyle
                : style.itemDefaultStyle
            }
            iconProps={{
              name: 'selector',
              iconSize: 24,
              iconType: 'plain',
              tintColor: $config.FONT_COLOR,
            }}
          />
          <IconButton
            toolTipMessage="Selection Area"
            placement={'right'}
            showTooltipArrow={false}
            onPress={() => {
              handleSelect(ApplianceNames.selector);
            }}
            hoverEffect={true}
            hoverEffectStyle={style.itemHoverStyle}
            containerStyle={
              selectedTool === ApplianceNames.selector
                ? style.itemSelectedStyle
                : style.itemDefaultStyle
            }
            iconProps={{
              name: 'area-selection',
              iconSize: 24,
              iconType: 'plain',
              tintColor: $config.FONT_COLOR,
            }}
          />
          <IconButton
            toolTipMessage="Text"
            placement={'right'}
            showTooltipArrow={false}
            onPress={() => {
              handleSelect(ApplianceNames.text);
            }}
            hoverEffect={true}
            hoverEffectStyle={style.itemHoverStyle}
            containerStyle={
              selectedTool === ApplianceNames.text
                ? style.itemSelectedStyle
                : style.itemDefaultStyle
            }
            iconProps={{
              name: 'text',
              iconSize: 24,
              iconType: 'plain',
              tintColor: $config.FONT_COLOR,
            }}
          />
          <IconButton
            toolTipMessage="Pencil"
            placement={'right'}
            showTooltipArrow={false}
            onPress={() => {
              handleSelect(ApplianceNames.pencil);
            }}
            hoverEffect={true}
            hoverEffectStyle={style.itemHoverStyle}
            containerStyle={
              selectedTool === ApplianceNames.pencil
                ? style.itemSelectedStyle
                : style.itemDefaultStyle
            }
            iconProps={{
              name: 'pen',
              iconSize: 24,
              iconType: 'plain',
              tintColor: $config.FONT_COLOR,
            }}
          />
          <div
            onMouseEnter={() => {
              setShapeBtnHovered(true);
            }}
            onMouseLeave={() => {
              setTimeout(() => {
                setShapeBtnHovered(false);
              }, 250);
            }}>
            <IconButton
              //toolTipMessage={showShapes ? '' : 'Shapes'}
              placement={'right'}
              showTooltipArrow={false}
              onPress={() => {
                // //open submenu
                // setShowColorPicker(false);
                // setShowShapes(!showShapes);
              }}
              hoverEffect={true}
              hoverEffectStyle={style.itemHoverStyle}
              containerStyle={
                selectedTool === ApplianceNames.rectangle ||
                selectedTool === ApplianceNames.arrow ||
                selectedTool === ApplianceNames.ellipse ||
                selectedTool === ApplianceNames.straight
                  ? style.itemSelectedStyle
                  : style.itemDefaultStyle
              }
              iconProps={{
                name: 'shapes',
                iconSize: 24,
                iconType: 'plain',
                tintColor: $config.FONT_COLOR,
              }}
            />
          </div>
          <div
            onMouseEnter={() => {
              setColorBtnHovered(true);
            }}
            onMouseLeave={() => {
              setTimeout(() => {
                setColorBtnHovered(false);
              }, 250);
            }}>
            <IconButton
              //toolTipMessage={showColorPicker ? '' : 'Colors'}
              placement={'right'}
              showTooltipArrow={false}
              onPress={() => {
                //opensubmenu
                // setShowShapes(false);
                // setShowColorPicker(!showColorPicker);
              }}
              hoverEffect={true}
              hoverEffectStyle={style.itemHoverStyle}
              containerStyle={style.itemDefaultStyle}
              iconProps={{
                name: 'gradient',
                iconSize: 24,
                iconType: 'plain',
                tintColor: '#EAC443',
              }}
            />
          </div>
          <IconButton
            toolTipMessage="Move"
            placement={'right'}
            showTooltipArrow={false}
            onPress={() => {
              handleSelect(ApplianceNames.hand);
            }}
            hoverEffect={true}
            hoverEffectStyle={style.itemHoverStyle}
            containerStyle={
              selectedTool === ApplianceNames.hand
                ? style.itemSelectedStyle
                : style.itemDefaultStyle
            }
            iconProps={{
              name: 'move',
              iconSize: 24,
              iconType: 'plain',
              tintColor: $config.FONT_COLOR,
            }}
          />
          <IconButton
            toolTipMessage="Laser"
            placement={'right'}
            showTooltipArrow={false}
            onPress={() => {
              handleSelect(ApplianceNames.laserPointer);
            }}
            hoverEffect={true}
            hoverEffectStyle={style.itemHoverStyle}
            containerStyle={
              selectedTool === ApplianceNames.laserPointer
                ? style.itemSelectedStyle
                : style.itemDefaultStyle
            }
            iconProps={{
              name: 'highlight',
              iconSize: 24,
              iconType: 'plain',
              tintColor: $config.FONT_COLOR,
            }}
          />
          <IconButton
            toolTipMessage="Erase"
            placement={'right'}
            showTooltipArrow={false}
            onPress={() => {
              handleSelect(ApplianceNames.eraser);
            }}
            hoverEffect={true}
            hoverEffectStyle={style.itemHoverStyle}
            containerStyle={
              selectedTool === ApplianceNames.eraser
                ? style.itemSelectedStyle
                : style.itemDefaultStyle
            }
            iconProps={{
              name: 'erasor',
              iconSize: 24,
              iconType: 'plain',
              tintColor: $config.FONT_COLOR,
            }}
          />
          <IconButton
            toolTipMessage="Clear All"
            placement={'right'}
            showTooltipArrow={false}
            onPress={() => {
              handleClear();
            }}
            hoverEffect={true}
            hoverEffectStyle={style.itemHoverStyle}
            containerStyle={style.itemDefaultStyle}
            iconProps={{
              name: 'clear-all',
              iconSize: 24,
              iconType: 'plain',
              tintColor: $config.FONT_COLOR,
            }}
          />
          {isWeb() ? (
            <>
              <input
                type="file"
                id="docpicker"
                accept="application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf,image/png,image/jpeg"
                hidden
                onInput={onFileChange}
              />
              <IconButton
                onPress={() => {
                  document.getElementById('docpicker').click();
                }}
                toolTipMessage="Upload Pdf and Images"
                placement={'right'}
                showTooltipArrow={false}
                hoverEffect={true}
                hoverEffectStyle={style.itemHoverStyle}
                containerStyle={style.itemDefaultStyle}
                iconProps={{
                  name: 'upload-new',
                  iconSize: 24,
                  iconType: 'plain',
                  tintColor: $config.FONT_COLOR,
                }}
              />
            </>
          ) : (
            <></>
          )}
          <IconButton
            onPress={() => {
              testImageUpload();
            }}
            toolTipMessage="Test upload"
            placement={'right'}
            showTooltipArrow={false}
            hoverEffect={true}
            hoverEffectStyle={style.itemHoverStyle}
            containerStyle={style.itemDefaultStyle}
            iconProps={{
              name: 'upload-new',
              iconSize: 24,
              iconType: 'plain',
              tintColor: $config.FONT_COLOR,
            }}
          />
        </View>
      </View>
    </>
  );
  /**old toolbar 
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
        {isWeb() ? (
          <>
            <input
              type="file"
              id="docpicker"
              accept="application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf,image/png,image/jpeg"
              hidden
              onInput={onFileChange}
            />
            <Pressable
              style={style.tool}
              onPress={() => {
                document.getElementById('docpicker').click();
              }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                fill="none">
                <title>File Upload</title>
                <path
                  d="M12 14V4M12 4L9.5001 6.5M12 4L14.5001 6.5M15.5001 14H16C16.9428 14 17.4142 14 17.7071 14.2929C18 14.5858 18 15.0572 18 16V18C18 18.9428 18 19.4142 17.7071 19.7071C17.4142 20 16.9428 20 16 20H8.0001C7.05729 20 6.58588 20 6.29299 19.7071C6.0001 19.4142 6.0001 18.9428 6.0001 18V16C6.0001 15.0572 6.0001 14.5858 6.29299 14.2929C6.58588 14 7.05729 14 8.0001 14H8.5001"
                  stroke="#464455"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </Pressable>
          </>
        ) : (
          <></>
        )}
      </View>
    </View>
  );
  */
};

const style = StyleSheet.create({
  itemSelectedStyle: {
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    padding: 8,
    borderRadius: 4,
  },
  itemDefaultStyle: {
    padding: 8,
    borderRadius: 4,
  },
  itemHoverStyle: {
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    borderRadius: 4,
  },
  toolboxContainer: {
    position: 'absolute',
    top: 60,
    left: 12,
    zIndex: 10,
  },
  toolboxShapesContainer: {
    position: 'absolute',
    top: 160,
    left: 65,
    zIndex: 10,
  },
  toolboxColorsContainer: {
    position: 'absolute',
    top: 90,
    left: 65,
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
  toolboxNew: {
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderRadius: 4,
    marginRight: 'auto',
    padding: 4,
    height: 'auto',
    width: 'auto',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
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
  toolIconActive: {
    height: 24,
    width: 24,
    borderRadius: 20,
    padding: 3,
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderWidth: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIcon: {
    height: 24,
    width: 24,
    borderRadius: 20,
    padding: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WhiteboardToolBox;

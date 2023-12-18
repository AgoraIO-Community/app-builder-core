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
import {hexToRgb, isMobileUA, isWeb, randomString} from '../../utils/common';
import {ApplianceNames} from 'white-web-sdk';
import StorageContext from '../../components/StorageContext';
import {useRoomInfo} from '../room-info/useRoomInfo';
import Toast from '../../../react-native-toast-message';
import {IconButton, whiteboardContext, useContent} from 'customization-api';
import LocalEventEmitter, {
  LocalEventsEnum,
} from '../../rtm-events-api/LocalEvents';
import {BoardColor} from './WhiteboardConfigure';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import StrokeWidthTool from './StrokeWidthTool';
import {useVideoCall} from '../../components/useVideoCall';

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
  const {setShowWhiteboardClearAllPopup} = useVideoCall();
  const [roomState, setRoomState] = useState(whiteboardRoom?.current?.state);
  const [showShapes, setShowShapes] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('black');
  const {
    data: {roomId},
  } = useRoomInfo();
  const {store} = useContext(StorageContext);
  const {setUploadRef, insertImageIntoWhiteboard, boardColor, whiteboardUid} =
    useContext(whiteboardContext);
  const [isShapeBtnHovered, setShapeBtnHovered] = useState(false);
  const [isShapeContainerHovered, setShapeContainerHovered] = useState(false);
  const [isColorBtnHovered, setColorBtnHovered] = useState(false);
  const [isColorContainerHovered, setColorContainerHovered] = useState(false);
  const handleSelect = (applicanceName: ApplianceNames) => {
    if (applicanceName !== ApplianceNames.selector) {
      setCursorColor(ColorPickerValues[selectedColor].rgb);
    }
    setSelectedTool(applicanceName);
    whiteboardRoom.current?.setMemberState({
      currentApplianceName: applicanceName,
    });
  };

  useEffect(() => {
    whiteboardRoom?.current?.callbacks.on('onRoomStateChanged', modifyState => {
      setRoomState({
        ...whiteboardRoom?.current?.state,
        ...modifyState,
      });
    });
    LocalEventEmitter.on(LocalEventsEnum.CLEAR_WHITEBOARD, () => {
      whiteboardRoom.current?.cleanCurrentScene();
      setShowWhiteboardClearAllPopup(false);
    });
  }, []);

  useEffect(() => {
    if (boardColor === BoardColor.Black) {
      setCursorColor(ColorPickerValues['white'].rgb);
      setSelectedColor('white');
    } else {
      setCursorColor(ColorPickerValues['black'].rgb);
      setSelectedColor('black');
    }
  }, [boardColor]);

  const handleClear = () => {
    //whiteboardRoom.current?.cleanCurrentScene();
    setShowWhiteboardClearAllPopup(true);
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
      const renderItemsRow1 = [];
      const renderItemsRow2 = [];
      const renderItemsRow3 = [];
      const renderItemsRow4 = [];
      let count = 0;
      for (const key in ColorPickerValues) {
        if (Object.prototype.hasOwnProperty.call(ColorPickerValues, key)) {
          const element = ColorPickerValues[key];
          let iconButtonColor = (
            <IconButton
              onPress={() => {
                setCursorColor(element.rgb);
                setSelectedColor(key);
                setShowColorPicker(false);
                setColorBtnHovered(false);
                setColorContainerHovered(false);
              }}
              hoverEffect={selectedColor === key ? false : true}
              hoverEffectStyle={{
                backgroundColor: element.hex + hexadecimalTransparency['50%'],
                borderRadius: 50,
              }}
              containerStyle={
                selectedColor === key
                  ? style.colorSelectedStyle
                  : style.itemDefaultStyle
              }
              iconProps={
                selectedColor === key
                  ? {
                      name: 'gradient',
                      iconSize: 24,
                      iconType: 'plain',
                      tintColor: element.hex,
                    }
                  : {
                      name: 'gradient',
                      iconSize: 24,
                      iconType: 'plain',
                      tintColor: element.hex,
                    }
              }
            />
          );
          iconButtonColor =
            selectedColor === key ? (
              <View
                style={{
                  borderRadius: 50,
                  backgroundColor: element.hex,
                  padding: 4,
                  margin: 2,
                }}>
                {iconButtonColor}
              </View>
            ) : (
              <View style={{margin: 2}}>{iconButtonColor}</View>
            );
          if (count >= 0 && count <= 3) renderItemsRow1.push(iconButtonColor);
          if (count >= 4 && count <= 7) renderItemsRow2.push(iconButtonColor);
          if (count >= 8 && count <= 12) renderItemsRow3.push(iconButtonColor);

          count = count + 1;
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
            <View style={style.toolboxNewColor}>
              <View style={{marginVertical: 8}}>
                <StrokeWidthTool
                  room={whiteboardRoom?.current}
                  roomState={roomState}
                />
              </View>
              <View style={[style.toolboxRow, {paddingBottom: 2}]}>
                {renderItemsRow1}
              </View>
              <View style={[style.toolboxRow, {paddingBottom: 2}]}>
                {renderItemsRow2}
              </View>
              <View style={[style.toolboxRow, {paddingBottom: 2}]}>
                {renderItemsRow3}
              </View>
              <View style={style.toolboxRow}>{renderItemsRow4}</View>
            </View>
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

  const {activeUids} = useContent();

  if (activeUids && activeUids[0] !== whiteboardUid) {
    return null;
  }

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
              const arr = hexToRgb($config.PRIMARY_ACTION_BRAND_COLOR);
              if (arr && arr?.length) {
                setCursorColor(arr);
              }
              handleSelect(ApplianceNames.selector);
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
                //name: 'gradient',
                name: 'color-picker',
                iconSize: 24,
                iconType: 'plain',
                tintColor: $config.FONT_COLOR,
                //tintColor: ColorPickerValues[selectedColor]?.hex,
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
};

const style = StyleSheet.create({
  itemSelectedStyle: {
    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    padding: 8,
    borderRadius: 4,
  },
  colorSelectedStyle: {
    padding: 4,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderRadius: 50,
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
    top: 180,
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
  toolboxNewColor: {
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderRadius: 4,
    padding: 4,
    height: 'auto',
    maxWidth: 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    zIndex: 10,
  },
  toolboxRow: {
    display: 'flex',
    flexDirection: 'row',
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

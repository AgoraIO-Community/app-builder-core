import React, {useState, useRef, useContext} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';

import {useIsSmall, isMobileUA, isWebInternal} from '../../../src/utils/common';

import CommonStyles from '../CommonStyles';
import {useLayout} from '../../../src/utils/useLayout';
import {getGridLayoutName} from '../../pages/video-call/DefaultLayouts';
import {VBHeader} from '../../../src/pages/video-call/SidePanelHeader';
import useCaptionWidth from '../../subComponents/caption/useCaptionWidth';
import ImageIcon from '../../atoms/ImageIcon';
import {Option, saveImagesToIndexDB, useVB, VBMode} from './useVB';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';
import VideoPreview from './VideoPreview';
import {SidePanelType, useLocalUserInfo, useSidePanel} from 'customization-api';
import ThemeConfig from '../../theme';
import TertiaryButton from '../../atoms/TertiaryButton';
import PrimaryButton from '../../atoms/PrimaryButton';
import Spacer from '../../atoms/Spacer';
import Toast from '../../../react-native-toast-message';
import PropsContext, {
  ToggleState,
} from '../../../agora-rn-uikit/src/Contexts/PropsContext';
import {IconsInterface} from '../../atoms/CustomIcon';

const screenHeight = Dimensions.get('window').height;

interface VBCardProps {
  type: VBMode;
  icon: keyof IconsInterface;
  path?: string & {default?: string};
}

const convertBlobToBase64 = async (blobURL: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = reject;
    xhr.open('GET', blobURL);
    xhr.send();
  });
};

const VBCard: React.FC<VBCardProps> = ({type, icon, path}) => {
  const {
    setVBmode,
    setSelectedImage,
    selectedImage,
    vbMode,
    setSaveVB,
    setOptions,
  } = useVB();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];

    if (selectedFile) {
      // check if file size (less than 1MB)
      if (selectedFile.size <= 1024 * 1024) {
        // check image format
        if (
          selectedFile.type === 'image/jpeg' ||
          selectedFile.type === 'image/png'
        ) {
          convertBlobToBase64(URL.createObjectURL(selectedFile))
            .then((base64Data: string) => {
              //base64Data as the source for the Image component
              const newCard: Option = {
                type: 'image',
                icon: 'vb',
                path: base64Data,
              };
              setOptions(prevOptions => {
                const updatedOptions = [...prevOptions];
                updatedOptions.splice(3, 0, newCard);
                return updatedOptions;
              });
              saveImagesToIndexDB(base64Data);
            })
            .catch(error => {
              console.error('Error converting Blob URL to base64:', error);
            });
        } else {
          Toast.show({
            type: 'error',
            text2: 'Please select a JPG or PNG file',
            text1: 'Upload Failed',
            visibilityTime: 3000,
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text2: 'File size must be less than 1MB.',
          text1: 'Upload Failed',
          visibilityTime: 3000,
        });
      }
    }
  };

  const handleClick = () => {
    setSaveVB(false);
    setVBmode(type);
    if (path) {
      setSelectedImage(path);
    } else {
      setSelectedImage(null);
    }
    if (type === 'custom' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isSelected = path ? path === selectedImage : vbMode === type;

  return (
    <Pressable
      style={[styles.card, isSelected && styles.active]}
      onPress={handleClick}>
      {isSelected && type !== 'custom' && <TickIcon />}
      {path ? (
        <Image
          style={styles.img}
          source={{uri: path?.default ? path.default : path}}
        />
      ) : (
        <div>
          <>
            {type === 'custom' ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{display: 'none'}}
                id={`file-input-${type}`}
                ref={fileInputRef}
              />
            ) : (
              <></>
            )}
            <ImageIcon
              iconType="plain"
              iconSize={24}
              name={icon}
              tintColor={$config.SECONDARY_ACTION_COLOR}
            />
          </>
        </div>
      )}
    </Pressable>
  );
};

const TickIcon: React.FC = () => {
  return (
    <View style={styles.tickContainer}>
      <View style={styles.triangle} />
      <ImageIcon
        iconSize={14}
        base64={true}
        name="done"
        iconType="plain"
        base64TintColor={$config.SECONDARY_ACTION_COLOR}
      />
    </View>
  );
};

const VBPanel: React.FC = () => {
  const isSmall = useIsSmall();

  const {currentLayout} = useLayout();
  const {transcriptHeight} = useCaptionWidth();
  const {setIsVBActive, setSaveVB, options} = useVB();
  const {setSidePanel} = useSidePanel();
  const {video: localVideoStatus} = useLocalUserInfo();
  const maxPanelHeight = screenHeight * 0.8;

  const isLocalVideoON = localVideoStatus === ToggleState.enabled;

  const {
    rtcProps: {callActive},
  } = useContext(PropsContext);

  return (
    <View
      style={[
        !callActive
          ? {height: maxPanelHeight}
          : isMobileUA()
          ? CommonStyles.sidePanelContainerNative
          : isSmall()
          ? CommonStyles.sidePanelContainerWebMinimzed
          : CommonStyles.sidePanelContainerWeb,
        isWebInternal() && !isSmall() && currentLayout === getGridLayoutName()
          ? {marginVertical: 4}
          : {},
        transcriptHeight && !isMobileUA() && {height: transcriptHeight},
      ]}>
      <VBHeader />

      {!callActive && !isLocalVideoON ? (
        <View style={styles.textContainer}>
          <View style={styles.iconStyleView}>
            <ImageIcon
              iconSize={20}
              iconType="plain"
              name={'done-fill'}
              base64={true}
              base64TintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
            />
          </View>
          <Text style={styles.text}>
            Selected effects will be applied once the camera is turned ON.
          </Text>
        </View>
      ) : (
        <></>
      )}

      {callActive ? <VideoPreview /> : <></>}
      <ScrollView>
        <View style={styles.container}>
          {options.map((item, index) => (
            <VBCard
              key={index}
              type={item.type}
              icon={item.icon}
              path={item.path}
            />
          ))}
        </View>
      </ScrollView>
      {callActive ? (
        <View style={styles.btnContainer}>
          <View style={{flex: 1}}>
            <TertiaryButton
              text={'Cancel'}
              textStyle={styles.btnText}
              containerStyle={styles.btn}
              onPress={() => {
                setSidePanel(SidePanelType.None);
                setIsVBActive(false);
              }}
            />
          </View>
          <Spacer size={12} horizontal />
          <View style={{flex: 1}}>
            <PrimaryButton
              textStyle={styles.btnText}
              containerStyle={styles.btn}
              onPress={() => {
                setSaveVB(true);
              }}
              text={'Save'}
            />
          </View>
        </View>
      ) : (
        <></>
      )}
    </View>
  );
};

export default VBPanel;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    aspectRatio: 2 / 1,
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  active: {
    borderWidth: 1,
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 24,
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderBottomColor: 'transparent',
    position: 'absolute',
    top: 0,
    right: 0,
  },

  tickContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderTopLeftRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 1,
  },
  btnText: {
    fontWeight: '600',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: $config.CARD_LAYER_3_COLOR,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: ThemeConfig.BorderRadius.small,
    minWidth: 'auto',
  },
  text: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
  },
  textContainer: {
    padding: 12,
    borderRadius: 4,
    borderLeftColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    borderLeftWidth: 4,
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    margin: 20,
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconStyleView: {
    marginRight: 4,
  },
});

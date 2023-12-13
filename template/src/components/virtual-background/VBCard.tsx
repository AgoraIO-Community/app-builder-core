import React, {useRef} from 'react';
import {View, Pressable, Image, Text, StyleSheet} from 'react-native';
import {Option, VBMode, useVB} from './useVB';
import ThemeConfig from '../../theme';
import {IconsInterface} from '../../atoms/CustomIcon';
import Toast from '../../../react-native-toast-message';
import {saveImagesToIndexDB, convertBlobToBase64} from './VButils';
import ImageIcon from '../../atoms/ImageIcon';

interface VBCardProps {
  type: VBMode;
  icon: keyof IconsInterface;
  path?: string & {default?: string};
  label?: string;
  position?: number;
  isOnPrecall?: boolean;
  isMobile?: boolean;
}

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

const VBCard: React.FC<VBCardProps> = ({
  type,
  icon,
  path,
  label,
  position,
  isOnPrecall,
  isMobile,
}) => {
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
      // check if file size (less than 3MB)
      if (selectedFile.size <= 1024 * 1024 * 3) {
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
            leadingIconName: 'alert',
            type: 'error',
            text2: 'Please select a JPG or PNG file',
            text1: 'Upload Failed',
            visibilityTime: 3000,
          });
        }
      } else {
        Toast.show({
          leadingIconName: 'alert',
          type: 'error',
          text2: 'File size must be less than 3MB.',
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
      style={[
        styles.card,
        isMobile ? styles.mobileCard : styles.desktopCard,
        isSelected && styles.active,
        isOnPrecall && !isMobile && position % 3 !== 0 ? {marginRight: 8} : {},
        isOnPrecall && !isMobile ? {marginBottom: 8, width: '31.8%'} : {},
      ]}
      onPress={handleClick}>
      {isSelected && type !== 'custom' && <TickIcon />}
      {path ? (
        <Image
          style={styles.img}
          source={{uri: path?.default ? path.default : path}}
        />
      ) : (
        <View>
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
          {label ? (
            <Text
              style={{
                fontSize: ThemeConfig.FontSize.tiny,
                fontWeight: '400',
                fontFamily: ThemeConfig.FontFamily.sansPro,
                color: $config.SECONDARY_ACTION_COLOR,
                paddingVertical: 4,
              }}>
              {label}
            </Text>
          ) : (
            <></>
          )}
        </View>
      )}
    </Pressable>
  );
};

export default VBCard;

const styles = StyleSheet.create({
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
  card: {
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
  },
  desktopCard: {
    width: '48%',
    aspectRatio: 2 / 1,
    marginBottom: 12,
  },
  mobileCard: {
    width: 72,
    height: 72,
    marginRight: 6,
  },
  active: {
    borderWidth: 2,
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 4,
  },
});

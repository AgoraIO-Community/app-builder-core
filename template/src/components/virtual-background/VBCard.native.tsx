import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  ImageSourcePropType,
} from 'react-native';
import React from 'react';
import ThemeConfig from '../../theme';
import {IconsInterface} from '../../atoms/CustomIcon';
import {Option, VBMode, useVB} from './useVB';
import ImageIcon from '../../atoms/ImageIcon';

interface VBCardProps {
  type: VBMode;
  icon: keyof IconsInterface;
  path?: ImageSourcePropType;
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

  const isSelected = path ? path === selectedImage : vbMode === type;
  const handleClick = () => {
    setSaveVB(false);
    setVBmode(type);
    if (path) {
      setSelectedImage(String(path));
    } else {
      setSelectedImage(null);
    }
  };

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
        <Image style={styles.img} source={path ? path : null} />
      ) : (
        <View>
          {type === 'custom' ? <></> : <></>}
          <ImageIcon
            iconType="plain"
            iconSize={24}
            name={icon}
            tintColor={$config.SECONDARY_ACTION_COLOR}
          />
          {label ? (
            <View>
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
            </View>
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

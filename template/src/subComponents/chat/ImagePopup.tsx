import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import React, {SetStateAction} from 'react';
import Popup from '../../atoms/Popup';
import UserAvatar from '../../atoms/UserAvatar';
import ThemeConfig from '../../theme';
import {timeAgo} from '../../../src/utils';
import IconButton from '../../atoms/IconButton';

interface ImagePopupProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  imageUrl: string;
  fileName: string;
  timestamp: string;
  senderName: string;
  msgId: string;
}

const ImagePopup = (props: ImagePopupProps) => {
  const {
    modalVisible,
    setModalVisible,
    imageUrl,
    fileName,
    timestamp,
    senderName,
    msgId,
  } = props;
  const [isLoading, setIsLoading] = React.useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const CloseIcon = () => {
    return (
      <View>
        <IconButton
          hoverEffect={true}
          hoverEffectStyle={{
            backgroundColor: $config.ICON_BG_COLOR,
            borderRadius: 20,
          }}
          iconProps={{
            iconType: 'plain',
            iconSize: 24,
            iconContainerStyle: {
              padding: 0,
            },
            name: 'close',
            tintColor: $config.SECONDARY_ACTION_COLOR,
          }}
          onPress={() => {
            setModalVisible(false);
          }}
        />
      </View>
    );
  };

  const Loader = () => {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator
          size="large"
          color={$config.PRIMARY_ACTION_BRAND_COLOR}
        />
      </View>
    );
  };

  const HeaderComponent = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <UserAvatar
            name={senderName}
            containerStyle={styles.avatarContainerStyle}
            textStyle={styles.avatarTextStyle}
          />
          <View>
            <Text
              style={styles.nameText}
              numberOfLines={1}
              ellipsizeMode={'tail'}>
              {senderName}
            </Text>
            <View style={styles.subTextContainer}>
              <Text style={styles.subText} ellipsizeMode={'tail'}>
                {timeAgo(parseInt(timestamp))} - {fileName}
              </Text>
            </View>
          </View>
        </View>
        <CloseIcon />
      </View>
    );
  };
  return (
    <Popup
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      showCloseIcon={false}
      contentContainerStyle={styles.contentContainer}
      bodyContainerStyle={styles.bodyContainer}
      headerComponent={<HeaderComponent />}>
      {isLoading ? <Loader /> : null}
      <Image
        source={{uri: imageUrl}}
        style={styles.image}
        onLoad={handleImageLoad}
      />
    </Popup>
  );
};

/* 

*/

export default ImagePopup;

const styles = StyleSheet.create({
  contentContainer: {
    padding: 12,
    maxWidth: 800,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 16,
  },

  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  spinnerContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  bodyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnContainer: {
    position: 'absolute',
    top: -24,
    right: -24,
  },
  avatarContainerStyle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
  },
  avatarTextStyle: {
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 12,
    fontWeight: '400',
    color: $config.CARD_LAYER_1_COLOR,
  },
  nameText: {
    fontWeight: '700',
    fontSize: ThemeConfig.FontSize.normal,
    lineHeight: 20,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    flexDirection: 'row',
    color: $config.FONT_COLOR,
    textAlign: 'left',
  },
  subText: {
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.tiny,
    lineHeight: 16,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    flexDirection: 'row',
    color: $config.FONT_COLOR,
  },
  subTextContainer: {
    flexDirection: 'row',
  },
});

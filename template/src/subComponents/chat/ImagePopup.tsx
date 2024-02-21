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

interface ImagePopupProps {
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  imageUrl: string;
}

const ImagePopup = (props: ImagePopupProps) => {
  const {modalVisible, setModalVisible, imageUrl} = props;
  const [isLoading, setIsLoading] = React.useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };
  return (
    <Popup
      modalVisible={modalVisible}
      setModalVisible={setModalVisible}
      showCloseIcon={true}
      contentContainerStyle={styles.contentContainer}
      bodyContainerStyle={styles.bodyContainer}
      closeBtnStyle={styles.closeBtnContainer}>
      {isLoading ? (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator
            size="large"
            color={$config.PRIMARY_ACTION_BRAND_COLOR}
          />
        </View>
      ) : null}
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
    padding: 24,
    maxWidth: 800,
    width: '100%',
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
});

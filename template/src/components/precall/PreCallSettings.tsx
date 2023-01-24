import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import SettingsView from '../SettingsView';
import Popup from '../../atoms/Popup';
import ImageIcon from '../../atoms/ImageIcon';

interface PreCallSettingsProps {
  isMobileView?: boolean;
}

const PreCallSettings = (props: PreCallSettingsProps) => {
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const {isMobileView = true} = props;

  return (
    <>
      <Popup
        modalVisible={isSettingsVisible}
        setModalVisible={setIsSettingsVisible}
        title=""
        containerStyle={styles.containerStyle}
        contentContainerStyle={styles.contentContainer}
        showCloseIcon={false}>
        <SettingsView handleClose={() => setIsSettingsVisible(false)} />
      </Popup>

      <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
        <ImageIcon
          name={'settings'}
          tintColor={$config.PRIMARY_ACTION_BRAND_COLOR}
        />
      </TouchableOpacity>
    </>
  );
};

export default PreCallSettings;

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    borderRadius: 8,
    padding: 0,
  },
  containerStyle: {
    marginVertical: 100,
    paddingHorizontal: 16,
    alignItems: 'stretch',
  },
});

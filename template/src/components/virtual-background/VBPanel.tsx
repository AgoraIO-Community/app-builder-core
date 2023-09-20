import {Pressable, StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import {useIsSmall, isMobileUA, isWebInternal} from '../../../src/utils/common';
import CommonStyles from '../CommonStyles';
import {useLayout} from '../../../src/utils/useLayout';
import {getGridLayoutName} from '../../pages/video-call/DefaultLayouts';
import {VBHeader} from '../../../src/pages/video-call/SidePanelHeader';
import useCaptionWidth from '../../subComponents/caption/useCaptionWidth';
import ImageIcon from '../../atoms/ImageIcon';
import {useVB} from './useVB';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';

const VBCard = ({type, icon, path}) => {
  const {setVBmode, setSelectedImage, selectedImage, vbMode} = useVB();
  const handleClick = () => {
    setVBmode(type);
    if (path) setSelectedImage(path);
  };
  const isSelected = path ? path === selectedImage : vbMode === type;
  return (
    <Pressable
      style={[styles.card, isSelected && styles.active]}
      onPress={handleClick}>
      {path ? (
        <Image
          style={styles.img}
          source={{
            uri: path.default,
          }}
        />
      ) : (
        <ImageIcon
          iconType="plain"
          iconSize={24}
          name={icon}
          tintColor={$config.SECONDARY_ACTION_COLOR}
        />
      )}
    </Pressable>
  );
};

const VBPanel = props => {
  const isSmall = useIsSmall();
  const {showHeader = true, fromScreen = ''} = props;
  const {currentLayout} = useLayout();
  const {transcriptHeight} = useCaptionWidth();
  const options = [
    {type: 'none', icon: 'remove'},
    {type: 'blur', icon: 'blur'},
    {type: 'custom', icon: 'add'},
    {type: 'image', icon: 'vb', path: require('./images/book.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/beach.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/office.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/bedroom.jpg')},
    {type: 'image', icon: 'vb', path: require('./images/office1.jpg')},
  ];
  return (
    <View
      style={[
        fromScreen === 'preCall'
          ? {}
          : isMobileUA()
          ? //mobile and mobile web
            CommonStyles.sidePanelContainerNative
          : isSmall()
          ? // desktop minimized
            CommonStyles.sidePanelContainerWebMinimzed
          : // desktop maximized
            CommonStyles.sidePanelContainerWeb,
        isWebInternal() && !isSmall() && currentLayout === getGridLayoutName()
          ? {marginVertical: 4}
          : {},
        transcriptHeight && !isMobileUA() && {height: transcriptHeight},
      ]}>
      {showHeader && <VBHeader fromScreen={fromScreen} />}
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
    </View>
  );
};

export default VBPanel;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderwidth: 1,
    borderColor: 'white',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    height: 80,
    backgroundColor: $config.CARD_LAYER_4_COLOR,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  active: {
    borderWidth: 1,
    borderColor: 'blue',
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

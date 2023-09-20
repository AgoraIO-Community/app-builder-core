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
    if (path) {
      setSelectedImage(path);
    } else {
      setVBmode(type);
    }
  };
  const isSelected = path ? path === selectedImage : vbMode === type;
  return (
    <Pressable
      style={[styles.card, isSelected && styles.active]}
      onPress={handleClick}>
      {isSelected && <TickIcon />}
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

const TickIcon = () => {
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
});

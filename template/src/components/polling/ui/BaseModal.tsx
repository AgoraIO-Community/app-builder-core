import {Modal, View, StyleSheet, Text} from 'react-native';
import React, {ReactNode} from 'react';
import ThemeConfig from '../../../theme';
import hexadecimalTransparency from '../../../utils/hexadecimalTransparency';
import IconButton from '../../../atoms/IconButton';
import {isMobileUA} from '../../../utils/common';

interface TitleProps {
  title?: string;
  children?: ReactNode | ReactNode[];
}

function BaseModalTitle({title, children}: TitleProps) {
  return (
    <View style={style.header}>
      {title && (
        <View>
          <Text style={style.title}>{title}</Text>
        </View>
      )}
      {children}
    </View>
  );
}

interface ContentProps {
  children: ReactNode;
}

function BaseModalContent({children}: ContentProps) {
  return <View style={style.content}>{children}</View>;
}

interface ActionProps {
  children: ReactNode;
}
function BaseModalActions({children}: ActionProps) {
  return <View style={style.actions}>{children}</View>;
}

type BaseModalProps = {
  visible?: boolean;
  children: ReactNode;
  width?: number;
};

const BaseModal = ({
  children,
  visible = false,
  width = 650,
}: BaseModalProps) => {
  return (
    <Modal animationType="none" transparent={true} visible={visible}>
      <View style={style.baseModalBackDrop}>
        <View style={[style.baseModal, {width: width}]}>
          <View style={style.scrollView}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

type BaseModalCloseIconProps = {
  onClose: () => void;
};

const BaseModalCloseIcon = ({onClose}: BaseModalCloseIconProps) => {
  <View>
    <IconButton
      iconProps={{
        iconType: 'plain',
        iconContainerStyle: {
          padding: isMobileUA() ? 0 : 5,
        },
        name: 'close',
        tintColor: $config.SECONDARY_ACTION_COLOR,
      }}
      onPress={onClose}
    />
  </View>;
};
export {
  BaseModal,
  BaseModalTitle,
  BaseModalContent,
  BaseModalActions,
  BaseModalCloseIcon,
};

const style = StyleSheet.create({
  baseModalBackDrop: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor:
      $config.HARD_CODED_BLACK_COLOR + hexadecimalTransparency['60%'],
  },
  baseModal: {
    backgroundColor: $config.CARD_LAYER_1_COLOR,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    borderRadius: ThemeConfig.BorderRadius.large,
    shadowColor: $config.HARD_CODED_BLACK_COLOR,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: '90%',
    maxHeight: 800,
    overflow: 'scroll',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    display: 'flex',
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 20,
    minHeight: 72,
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
  },
  title: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.xLarge,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.48,
  },
  content: {
    padding: 32,
    gap: 20,
    display: 'flex',
    flexDirection: 'column',
    // minWidth: 620,
  },
  actions: {
    height: 72,
    paddingHorizontal: 32,
    paddingVertical: 12,
    display: 'flex',
    gap: 16,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
  },
});

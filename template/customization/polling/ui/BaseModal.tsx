import {
  Modal,
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import React, {ReactNode} from 'react';
import {
  ThemeConfig,
  hexadecimalTransparency,
  IconButton,
  isMobileUA,
  $config,
} from 'customization-api';

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
  noPadding?: boolean;
}

function BaseModalContent({children, noPadding}: ContentProps) {
  return (
    <ScrollView contentContainerStyle={style.scrollgrow}>
      <View style={[style.content, noPadding ? style.noPadding : {}]}>
        {children}
      </View>
    </ScrollView>
  );
}

interface ActionProps {
  children: ReactNode;
}
function BaseModalActions({children}: ActionProps) {
  return <View style={style.actions}>{children}</View>;
}

type BaseModalProps = {
  visible?: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  cancelable?: boolean;
};

const BaseModal = ({
  children,
  visible = false,
  width = 650,
  cancelable = false,
  onClose,
}: BaseModalProps) => {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={style.baseModalContainer}>
        <TouchableWithoutFeedback
          onPress={() => {
            cancelable && onClose();
          }}>
          <View style={style.baseBackdrop} />
        </TouchableWithoutFeedback>
        <View style={[style.baseModal, {width: width}]}>
          <View style={style.baseModalBody}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

type BaseModalCloseIconProps = {
  onClose: () => void;
};

const BaseModalCloseIcon = ({onClose}: BaseModalCloseIconProps) => {
  return (
    <View>
      <IconButton
        iconProps={{
          iconType: 'plain',
          iconSize: 24,
          iconContainerStyle: {
            padding: isMobileUA() ? 0 : 5,
          },
          name: 'close',
          tintColor: $config.SECONDARY_ACTION_COLOR,
        }}
        onPress={onClose}
      />
    </View>
  );
};
export {
  BaseModal,
  BaseModalTitle,
  BaseModalContent,
  BaseModalActions,
  BaseModalCloseIcon,
};

const style = StyleSheet.create({
  baseModalContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  baseModal: {
    zIndex: 2,
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
    minWidth: 520,
    maxWidth: '90%',
    maxHeight: '80%', // Set a maximum height for the modal
  },
  baseModalBody: {
    flex: 1,
  },
  baseBackdrop: {
    zIndex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor:
      $config.HARD_CODED_BLACK_COLOR + hexadecimalTransparency['60%'],
  },
  scrollgrow: {
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 20,
    height: 60,
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
  },
  noPadding: {
    padding: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    height: 60,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'center',
    flexShrink: 0,
    borderTopWidth: 1,
    borderTopColor: $config.CARD_LAYER_3_COLOR,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
  },
});

import React, {ReactNode, SetStateAction} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Spacer from '../../atoms/Spacer';
import Popup from '../../atoms/Popup';
import TertiaryButton from '../../atoms/TertiaryButton';
import PrimaryButton from '../../atoms/PrimaryButton';
import ThemeConfig from '../../theme';
import {useIsDesktop} from '../../utils/common';

export type ModalVariant = 'info' | 'warning' | 'error' | 'success';

export interface ConfirmationModalProps {
  visible: boolean;
  setVisible: React.Dispatch<SetStateAction<boolean>>;
  title: string;
  subTitle?: string;
  message?: string;
  variant?: ModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  footer?: ReactNode;
}

const VARIANT_COLOR: Record<ModalVariant, string> = {
  info: $config.SEMANTIC_NEUTRAL,
  warning: $config.SEMANTIC_WARNING,
  error: $config.SEMANTIC_ERROR,
  success: $config.SEMANTIC_SUCCESS,
};

const GenericPopup: React.FC<ConfirmationModalProps> = ({
  visible,
  setVisible,
  title,
  subTitle = '',
  message,
  variant = 'info',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  footer,
}) => {
  const isDesktop = useIsDesktop()('popup');
  const color = VARIANT_COLOR[variant];

  const handleCancel = () => {
    setVisible(false);
    onCancel && onCancel();
  };
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Popup
      modalVisible={visible}
      setModalVisible={setVisible}
      showCloseIcon={false}
      contentContainerStyle={styles.contentContainer}>
      <Text style={[styles.title, {color}]}>{title}</Text>
      <Spacer size={18} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {footer ? (
        <>
          <Spacer size={16} />
          {footer}
        </>
      ) : null}
      <Spacer size={32} />
      <View style={isDesktop ? styles.row : styles.column}>
        <View style={isDesktop && {flex: 1}}>
          <TertiaryButton
            containerStyle={styles.tertiary}
            textStyle={styles.buttonText}
            text={cancelLabel}
            onPress={handleCancel}
          />
        </View>
        <Spacer size={isDesktop ? 12 : 20} horizontal={isDesktop} />
        <View style={isDesktop && {flex: 1}}>
          <PrimaryButton
            containerStyle={[styles.primary, {backgroundColor: color}]}
            textStyle={styles.buttonText}
            text={confirmLabel}
            onPress={handleConfirm}
          />
        </View>
      </View>
    </Popup>
  );
};

export default GenericPopup;

const styles = StyleSheet.create({
  contentContainer: {
    padding: 24,
    maxWidth: 360,
    minWidth: 360,
  },
  title: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: 22,
  },
  subTitle: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: 14,
    color: $config.FONT_COLOR,
  },
  message: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: 14,
    color: $config.FONT_COLOR,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column-reverse',
  },
  primary: {
    minWidth: 'auto',
    width: '100%',
    borderRadius: ThemeConfig.BorderRadius.medium,
    height: 48,
    backgroundColor: $config.SEMANTIC_ERROR,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tertiary: {
    width: '100%',
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: ThemeConfig.BorderRadius.medium,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },
});

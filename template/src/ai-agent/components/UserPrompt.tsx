import React, {SetStateAction, useContext, useEffect, useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  ViewStyle,
  ModalProps,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import ThemeConfig from '../../theme';
import {AgentContext} from './AgentControls/AgentContext';
import {
  IconButton,
  PrimaryButton,
  Spacer,
  TertiaryButton,
  useRoomInfo,
} from 'customization-api';
import {useIsDesktop, isMobileUA, isAndroid, isIOS} from '../../utils/common';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';

const UserPrompt = () => {
  const isDesktop = useIsDesktop()('popup');
  const [isModalOpen, setModalOpen] = useState(false);
  const {prompt, setPrompt, agentConnectionState, agentId} =
    useContext(AgentContext);
  const {
    data: {agents},
  } = useRoomInfo();

  const [localPrompt, setLocalPrompt] = useState('');

  useEffect(() => {
    setLocalPrompt(prompt);
  }, [prompt]);

  useEffect(() => {
    if (!prompt && agentId && agents?.length) {
      setPrompt(agents?.find(a => a?.id === agentId)?.prompt);
    } else if (prompt) {
      setPrompt(prompt);
    }
  }, [agentId, agents, setPrompt, prompt]);
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text style={styles.label}>Customize Prompt</Text>
        <TouchableOpacity
          disabled={agentConnectionState === 'AGENT_CONNECTED' ? true : false}
          style={[
            styles.promptBtnContainer,
            agentConnectionState === 'AGENT_CONNECTED'
              ? styles.promptBtnContainerDisabled
              : {},
          ]}
          onPress={() => setModalOpen(true)}>
          <Text style={styles.promptBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <TextInput
          aria-disabled={true}
          style={[styles.input, {opacity: 0.4}]}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Customize Prompt"
          numberOfLines={4}
          multiline={true}
        />
      </View>
      <PromptModal
        modalVisible={isModalOpen}
        setModalVisible={setModalOpen}
        showCloseIcon={true}
        title={'Edit Prompt'}
        cancelable={false}
        contentContainerStyle={modalStyles.mContainer}>
        <View style={[modalStyles.mbody]}>
          <View
            style={[
              styles.container,
              styles.containerInModal,
              {flex: 3},
              !$config.CUSTOMIZE_AGENT ? {opacity: 0.4} : {},
            ]}>
            <TextInput
              style={[styles.input]}
              value={localPrompt}
              onChangeText={setLocalPrompt}
              placeholder="Customize Prompt"
              numberOfLines={45}
              multiline={true}
              aria-disabled={!$config.CUSTOMIZE_AGENT}
            />
          </View>
          {$config.CUSTOMIZE_AGENT ? (
            <>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoText}>
                  Fine-tune your AI agent’s behavior by editing its prompt.
                </Text>
              </View>
              <View
                style={[
                  isDesktop ? styles.btnContainer : styles.btnContainerMobile,
                  isMobileUA() ? {flex: 1} : {flex: 0.5},
                ]}>
                <TertiaryButton
                  containerStyle={{
                    width: 'auto',
                    minWidth: 124,
                    height: isAndroid() || isIOS() ? 'auto' : 36,
                    borderRadius: ThemeConfig.BorderRadius.medium,
                  }}
                  textStyle={styles.btnText}
                  text={'CANCEL'}
                  onPress={() => {
                    setLocalPrompt(prompt);
                    setModalOpen(false);
                  }}
                />
                <Spacer size={16} horizontal={isDesktop ? true : false} />
                <PrimaryButton
                  containerStyle={{
                    borderRadius: ThemeConfig.BorderRadius.medium,
                    backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
                    width: 'auto',
                    minWidth: 124,
                    height: isAndroid() || isIOS() ? 'auto' : 36,
                  }}
                  textStyle={styles.btnText}
                  text={'SAVE'}
                  onPress={() => {
                    setPrompt(localPrompt);
                    setModalOpen(false);
                  }}
                />
                <Spacer size={16} horizontal={isDesktop ? true : false} />
              </View>
            </>
          ) : (
            <Spacer size={20} horizontal={isDesktop ? true : false} />
          )}
        </View>
      </PromptModal>
    </>
  );
};

const styles = StyleSheet.create({
  infoTextContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoText: {
    color: $config.FONT_COLOR + hexadecimalTransparency['40%'],
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16,
  },
  promptBtnContainer: {
    paddingBottom: 8,
  },
  promptBtnContainerDisabled: {
    opacity: 0.4,
  },
  btnContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    borderTopWidth: 1,
    borderTopColor: $config.CARD_LAYER_3_COLOR,
  },
  btnContainerMobile: {
    flexDirection: 'column-reverse',
    padding: 20,
  },
  promptBtnText: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 14,
    lineHeight: 14,
  },
  btnText: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 8,
    overflow: 'hidden',
  },
  containerInModal: {
    margin: 20,
    marginBottom: $config.CUSTOMIZE_AGENT ? 8 : 20,
  },
  label: {
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    marginBottom: 8,
  },
  input: {
    color: $config.FONT_COLOR,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
});

interface PromptModalProps extends ModalProps {
  title?: string;
  subtitle?: string;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<SetStateAction<boolean>>;
  showCloseIcon?: boolean;
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  cancelable?: boolean;
}
const PromptModal = (props: PromptModalProps) => {
  const {
    title,
    modalVisible,
    setModalVisible,
    children,
    cancelable = false,
  } = props;

  const isDesktop = useIsDesktop()('popup');

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}>
      <View
        style={[modalStyles.centeredView, isDesktop && {alignItems: 'center'}]}>
        <TouchableWithoutFeedback
          onPress={() => {
            cancelable && setModalVisible(false);
          }}>
          <View style={modalStyles.backDrop} />
        </TouchableWithoutFeedback>
        <View style={[modalStyles.modalView, props?.contentContainerStyle]}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{title}</Text>
            <View>
              <IconButton
                hoverEffect={true}
                hoverEffectStyle={{
                  backgroundColor: $config.ICON_BG_COLOR,
                  borderRadius: 20,
                }}
                iconProps={{
                  iconType: 'plain',
                  iconContainerStyle: {
                    padding: isMobileUA() ? 0 : 5,
                  },
                  name: 'close',
                  tintColor: $config.SECONDARY_ACTION_COLOR,
                }}
                onPress={() => {
                  setModalVisible(false);
                }}
              />
            </View>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  mContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 0,
    // width: 620,
    width: '100%',
    maxWidth: 680,
    minWidth: 340,
    height: 620,
    maxHeight: 620,
    borderRadius: 4,
    zIndex: 2,
  },
  mHeader: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 20,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    backgroundColor: $config.CARD_LAYER_1_COLOR,
  },
  mbody: {
    width: '100%',
    flex: 1,
  },
  centeredView: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalView: {
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
    maxWidth: 650,
  },
  backDrop: {
    zIndex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor:
      $config.HARD_CODED_BLACK_COLOR + hexadecimalTransparency['60%'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
  },
  title: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: ThemeConfig.FontSize.xLarge,
    lineHeight: 32,
    fontWeight: '500',
    alignSelf: 'center',
  },
});

export default UserPrompt;

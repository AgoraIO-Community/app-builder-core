import {Text, StyleSheet, View} from 'react-native';
import React, {useEffect} from 'react';
import {
  BaseModal,
  BaseModalTitle,
  BaseModalContent,
  BaseModalActions,
} from './BaseModal';
import ThemeConfig from '../../../theme';
import TertiaryButton from '../../../atoms/TertiaryButton';
import {
  PollFormActionKind,
  PollStatus,
  usePollForm,
} from '../context/poll-form-context';
import {usePoll} from '../context/poll-context';
import {PollActionKind} from '../context/poll-context';
import {useLocalUid} from 'agora-rn-uikit';

export default function PollPreviewModal({visible}) {
  const {state, dispatch: pollFormDispatch} = usePollForm();
  const {dispatch: pollDispatch} = usePoll();
  const localUid = useLocalUid();

  const {form} = state;

  const onSave = (launch: boolean) => {
    pollDispatch({
      type: PollActionKind.ADD_FINAL_POLL_ITEM,
      payload: {
        item: {
          [localUid]: {
            ...form,
            status: launch ? PollStatus.LATER : PollStatus.ACTIVE,
            createdBy: localUid,
          },
        },
      },
    });
    pollFormDispatch({
      type: PollFormActionKind.POLL_FORM_CLOSE,
    });
  };

  return (
    <BaseModal visible={visible}>
      <BaseModalTitle title="Poll Preview" />
      <BaseModalContent>
        <View style={style.previewContainer}>
          {form.duration && (
            <Text style={style.previewTimer}>{form.timer}</Text>
          )}
          <Text style={style.previewQuestion}>{form.question}</Text>
          {form?.options ? (
            <View style={style.previewOptionSection}>
              {form.options.map(option => (
                <View style={style.previewOptionCard}>
                  <Text style={style.previewOptionText}>{option.text}</Text>
                </View>
              ))}
            </View>
          ) : (
            <></>
          )}
        </View>
      </BaseModalContent>
      <BaseModalActions>
        <View style={style.previewActions}>
          <View style={style.btnContainer}>
            <TertiaryButton
              onPress={() => {
                pollFormDispatch({
                  type: PollFormActionKind.UPDATE_FORM,
                });
              }}
              text="Edit"
            />
          </View>
          <View style={style.btnContainer}>
            <TertiaryButton
              text="Save for later"
              onPress={() => {
                onSave(false);
              }}
            />
          </View>
          <View style={style.btnContainer}>
            <TertiaryButton
              text="Launch Now"
              onPress={() => {
                onSave(true);
              }}
            />
          </View>
        </View>
      </BaseModalActions>
    </BaseModal>
  );
}

export const style = StyleSheet.create({
  previewContainer: {
    width: 550,
  },
  previewTimer: {
    color: $config.SEMANTIC_WARNING,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 16,
    lineHeight: 20,
    paddingBottom: 12,
  },
  previewQuestion: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.medium,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 24,
    fontWeight: '600',
    paddingBottom: 20,
  },
  previewOptionSection: {
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 9,
    paddingVertical: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  previewOptionCard: {
    display: 'flex',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  previewOptionText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    lineHeight: 24,
  },
  previewActions: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  },
  btnContainer: {
    flex: 1,
  },
});

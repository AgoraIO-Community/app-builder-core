import {Text, StyleSheet, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {
  BaseModalTitle,
  BaseModalContent,
  BaseModalActions,
  BaseModalCloseIcon,
} from '../../ui/BaseModal';
import {PollItem} from '../../context/poll-context';
import BaseRadioButton from '../../ui/BaseRadioButton';
import {
  PrimaryButton,
  TertiaryButton,
  Checkbox,
  ThemeConfig,
  $config,
} from 'customization-api';

interface Props {
  form: PollItem;
  onEdit: () => void;
  onSave: (launch: boolean) => void;
  onClose: () => void;
}

export default function PreviewPollFormView({
  form,
  onEdit,
  onSave,
  onClose,
}: Props) {
  return (
    <>
      <BaseModalTitle title="Launch Poll">
        <BaseModalCloseIcon onClose={onClose} />
      </BaseModalTitle>
      <BaseModalContent noPadding>
        <View style={style.previewContainer}>
          <View style={style.previewInfoContainer}>
            <View>
              <Text style={style.previewInfoText}>
                Here is a preview of the poll you will be sending
              </Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => {
                  onEdit();
                }}>
                <Text style={style.editText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={style.previewFormContainer}>
            <View style={style.previewFormCard}>
              <View>
                <Text style={style.previewQuestion}>{form.question}</Text>
              </View>
              {form?.options ? (
                <View style={style.previewOptionSection}>
                  {form.multiple_response
                    ? form.options.map((option, index) => (
                        <View style={style.previewOptionCard} key={index}>
                          <Checkbox
                            key={index}
                            checked={false}
                            disabled={true}
                            label={option.text}
                            labelStye={style.previewOptionText}
                            onChange={() => {}}
                          />
                        </View>
                      ))
                    : form.options.map((option, index) => (
                        <View style={style.previewOptionCard} key={index}>
                          <BaseRadioButton
                            disabled
                            option={{
                              label: option.text,
                              value: option.value,
                            }}
                            labelStyle={style.previewOptionText}
                            checked={false}
                            onChange={() => {}}
                          />
                        </View>
                      ))}
                </View>
              ) : (
                <></>
              )}
            </View>
          </View>
        </View>
      </BaseModalContent>
      <BaseModalActions>
        <View style={style.previewActions}>
          <View>
            <TertiaryButton
              containerStyle={style.btnContainer}
              text="Save for later"
              textStyle={style.btnText}
              onPress={() => {
                onSave(false);
              }}
            />
          </View>
          <View>
            <PrimaryButton
              containerStyle={style.btnContainer}
              text="Launch Now"
              textStyle={style.btnText}
              onPress={() => {
                onSave(true);
              }}
            />
          </View>
        </View>
      </BaseModalActions>
    </>
  );
}

export const style = StyleSheet.create({
  previewContainer: {
    // width: 550,
  },
  previewInfoContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  previewInfoText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 20,
    fontWeight: '400',
  },
  editText: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 20,
    fontWeight: '600',
  },
  previewFormContainer: {
    backgroundColor: $config.BACKGROUND_COLOR,
    paddingVertical: 40,
    paddingHorizontal: 60,
  },
  previewFormCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: 20,
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_4_COLOR,
    backgroundColor: $config.CARD_LAYER_3_COLOR,
  },
  previewQuestion: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.medium,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 24,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  previewOptionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  previewOptionCard: {
    display: 'flex',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: $config.CARD_LAYER_4_COLOR,
  },
  previewOptionText: {
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  previewActions: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  btnContainer: {
    minWidth: 150,
    height: 36,
    borderRadius: 4,
  },
  btnText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

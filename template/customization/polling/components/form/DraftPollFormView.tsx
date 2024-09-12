import {Text, View, StyleSheet, TextInput} from 'react-native';
import React from 'react';
import {
  BaseModalTitle,
  BaseModalContent,
  BaseModalActions,
  BaseModalCloseIcon,
} from '../../ui/BaseModal';
import {
  LinkButton,
  Checkbox,
  IconButton,
  PrimaryButton,
  ThemeConfig,
  $config,
} from 'customization-api';
import {PollFormErrors, PollItem, PollKind} from '../../context/poll-context';
import {nanoid} from 'nanoid';

function FormTitle({title}: {title: string}) {
  return (
    <View>
      <Text style={style.pFormTitle}>{title}</Text>
    </View>
  );
}
interface Props {
  form: PollItem;
  setForm: React.Dispatch<React.SetStateAction<PollItem>>;
  onPreview: () => void;
  errors: Partial<PollFormErrors>;
  onClose: () => void;
}

export default function DraftPollFormView({
  form,
  setForm,
  onPreview,
  errors,
  onClose,
}: Props) {
  const handleInputChange = (field: string, value: string | boolean) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleCheckboxChange = (field: keyof typeof form, value: boolean) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const updateFormOption = (
    action: 'update' | 'delete' | 'add',
    value: string,
    index: number,
  ) => {
    if (action === 'add') {
      setForm({
        ...form,
        options: [
          ...form.options,
          {
            text: '',
            value: '',
            votes: [],
            percent: '0',
          },
        ],
      });
    }
    if (action === 'update') {
      setForm({
        ...form,
        options: form.options.map((option, i) => {
          if (i === index) {
            const text = value.trim();
            const lowerText = text
              .replace(/\s+/g, '-')
              .toLowerCase()
              .concat('-')
              .concat(nanoid(2));
            return {
              ...option,
              text: text,
              value: lowerText,
              votes: [],
            };
          }
          return option;
        }),
      });
    }
    if (action === 'delete') {
      setForm({
        ...form,
        options: form.options.filter((option, i) => i !== index),
      });
    }
  };

  const getTitle = (type: PollKind) => {
    if (type === PollKind.MCQ) {
      return 'Multiple Choice';
    }
    if (type === PollKind.OPEN_ENDED) {
      return 'Open Ended Poll';
    }
    if (type === PollKind.YES_NO) {
      return 'Yes/No';
    }
  };

  return (
    <>
      <BaseModalTitle title={getTitle(form.type)}>
        <BaseModalCloseIcon onClose={onClose} />
      </BaseModalTitle>
      <BaseModalContent>
        {/* Question section */}
        <View style={style.createPollBox}>
          <View style={style.pFormSection}>
            <FormTitle title="Question" />
            <View>
              <TextInput
                autoComplete="off"
                style={style.pFormTextarea}
                multiline={true}
                numberOfLines={4}
                value={form.question}
                onChangeText={text => {
                  handleInputChange('question', text);
                }}
                placeholder="Enter poll question here..."
                placeholderTextColor={
                  $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low
                }
              />
              {errors?.question && (
                <Text style={style.errorText}>{errors.question.message}</Text>
              )}
            </View>
          </View>
          {/* Options section */}
          {form.type === PollKind.MCQ || form.type === PollKind.YES_NO ? (
            <View style={style.pFormSection}>
              <FormTitle title="Responses" />
              <View style={style.pFormOptions}>
                {form.type === PollKind.MCQ ? (
                  <>
                    {form.options.map((option, index) => (
                      <View style={style.pFormOptionCard} key={index}>
                        <Text style={style.pFormOptionPrefix}>{index + 1}</Text>
                        <TextInput
                          autoComplete="off"
                          id="input"
                          style={style.pFormInput}
                          value={option.text}
                          onChangeText={text => {
                            updateFormOption('update', text, index);
                          }}
                          placeholder="Add text here..."
                          placeholderTextColor={
                            $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low
                          }
                        />
                        {index > 1 ? (
                          <View>
                            <IconButton
                              iconProps={{
                                iconType: 'plain',
                                iconContainerStyle: {
                                  padding: 5,
                                },
                                iconSize: 20,
                                name: 'close',
                                tintColor: $config.CARD_LAYER_5_COLOR,
                              }}
                              onPress={() => {
                                updateFormOption('delete', option.text, index);
                              }}
                            />
                          </View>
                        ) : (
                          <></>
                        )}
                      </View>
                    ))}
                    <View style={style.pFormAddOptionLinkSection}>
                      <LinkButton
                        text="Add option"
                        textStyle={style.pFormOptionLink}
                        onPress={() => {
                          updateFormOption('add', null, null);
                        }}
                      />
                    </View>
                    {errors?.options && (
                      <Text style={style.errorText}>
                        {errors.options.message}
                      </Text>
                    )}
                  </>
                ) : (
                  <></>
                )}
                {form.type === PollKind.YES_NO ? (
                  <>
                    <View
                      style={[style.pFormOptionCard, style.verticalPadding]}>
                      <Text style={style.pFormOptionText}>Yes</Text>
                    </View>
                    <View
                      style={[style.pFormOptionCard, style.verticalPadding]}>
                      <Text style={style.pFormOptionText}>No</Text>
                    </View>
                  </>
                ) : (
                  <></>
                )}
              </View>
            </View>
          ) : (
            <></>
          )}
          {/* Sections templete */}
          <View style={style.pFormSection}>
            <View>
              {/* <View style={style.pFormCheckboxContainer}>
                {form.type === PollKind.MCQ ? (
                  <Checkbox
                    checked={form.multiple_response}
                    label={'Allow mutiple selections'}
                    labelStye={style.pFormOptionText}
                    onChange={() => {
                      handleCheckboxChange(
                        'multiple_response',
                        !form.multiple_response,
                      );
                    }}
                  />
                ) : (
                  <></>
                )}
              </View> */}
              {/* <View style={style.pFormCheckboxContainer}>
                <Checkbox
                  checked={form.share}
                  label={'Share results with the respondants'}
                  labelStye={style.pFormOptionText}
                  onChange={() => {
                    handleCheckboxChange('share', !form.share);
                  }}
                />
              </View> */}
              {/* <View style={style.pFormCheckboxContainer}>
                <Checkbox
                  checked={form.duration}
                  label={'Set Timer Duration'}
                  labelStye={style.pFormOptionText}
                  onChange={() => {
                    handleCheckboxChange('duration', !form.duration);
                  }}
                />
              </View> */}
            </View>
          </View>
        </View>
      </BaseModalContent>
      <BaseModalActions>
        <View style={style.previewActions}>
          <PrimaryButton
            containerStyle={style.btnContainer}
            textStyle={style.btnText}
            onPress={() => {
              onPreview();
            }}
            text="Preview"
          />
        </View>
      </BaseModalActions>
    </>
  );
}

export const style = StyleSheet.create({
  createPollBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  pFormSection: {
    gap: 12,
  },
  pFormAddOptionLinkSection: {
    marginTop: -8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  pFormTitle: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
    fontWeight: '600',
  },
  pFormTextarea: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
    fontWeight: '400',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    height: 110,
    outlineStyle: 'none',
    padding: 20,
  },
  pFormOptionText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
    fontWeight: '400',
  },
  pFormOptionPrefix: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
    paddingRight: 4,
  },
  pFormOptionLink: {
    fontWeight: '400',
    lineHeight: 24,
  },
  pFormOptions: {
    paddingVertical: 8,
    gap: 8,
  },
  pFormInput: {
    flex: 1,
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
    fontWeight: '400',
    outlineStyle: 'none',
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 9,
    paddingVertical: 12,
  },
  pFormOptionCard: {
    display: 'flex',
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 8,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 9,
  },
  verticalPadding: {
    paddingVertical: 12,
  },
  pFormCheckboxContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  previewActions: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  errorText: {
    color: $config.SEMANTIC_ERROR,
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    paddingLeft: 5,
    paddingTop: 5,
  },
});

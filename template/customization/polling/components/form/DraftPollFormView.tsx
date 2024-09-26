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
import Toggle from '../../../../src/atoms/Toggle';

function FormTitle({title}: {title: string}) {
  return (
    <View>
      <Text style={style.pFormTitle}>{title}</Text>
    </View>
  );
}
interface Props {
  form: PollItem;
  setForm: React.Dispatch<React.SetStateAction<PollItem | null>>;
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
          ...(form.options || []),
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
        options: form.options?.map((option, i) => {
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
        options: form.options?.filter((option, i) => i !== index) || [],
      });
    }
  };

  return (
    <>
      <BaseModalTitle title={'Create Poll'}>
        <BaseModalCloseIcon onClose={onClose} />
      </BaseModalTitle>
      <BaseModalContent>
        <View style={style.pForm}>
          {/* Question section */}
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
                placeholder="Enter your question here..."
                placeholderTextColor={
                  $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low
                }
              />
              {errors?.question && (
                <Text style={style.errorText}>{errors.question.message}</Text>
              )}
            </View>
          </View>
          {/* MCQ  section */}
          {form.type === PollKind.MCQ ? (
            <View style={style.pFormSection}>
              <View>
                <FormTitle title="Responses" />
                <View style={style.pushRight}>
                  <View style={style.pFormToggle}>
                    <Text style={style.pFormSettingsText}>
                      Allow Multiple Selections
                    </Text>
                    <Toggle
                      isEnabled={form.multiple_response}
                      toggleSwitch={value => {
                        handleCheckboxChange('multiple_response', value);
                      }}
                    />
                  </View>
                </View>
              </View>
              <View style={style.pFormOptions}>
                {form.options?.map((option, index) => (
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
                      placeholder={`Option ${index + 1}`}
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
                <View style={style.pFormOptionCard}>
                  <LinkButton
                    text="+ Add option"
                    textStyle={{
                      ...style.pFormOptionText,
                      ...style.pFormOptionLink,
                    }}
                    onPress={() => {
                      updateFormOption('add', '', -1);
                    }}
                  />
                </View>
                {errors?.options && (
                  <Text style={style.errorText}>{errors.options.message}</Text>
                )}
              </View>
            </View>
          ) : (
            <></>
          )}
          {/* Yes / No section */}
          {form.type === PollKind.YES_NO ? (
            <View style={style.pFormSection}>
              <FormTitle title="Responses" />
              <View style={style.pFormOptions}>
                <View style={[style.pFormOptionCard, style.verticalPadding]}>
                  <Text style={style.pFormOptionText}>Yes</Text>
                </View>
                <View style={[style.pFormOptionCard, style.verticalPadding]}>
                  <Text style={style.pFormOptionText}>No</Text>
                </View>
              </View>
            </View>
          ) : (
            <></>
          )}
          {/* Advanced settings section */}
          <View style={[style.pFormSection]}>
            <FormTitle title="Advance Settings" />
            <View style={style.pFormSettings}>
              <View style={style.pFormCheckboxContainer}>
                <View style={style.pFormToggle}>
                  <Text style={style.pFormSettingsText}>Set Poll Timer</Text>
                  <Toggle
                    isEnabled={form.duration}
                    toggleSwitch={value => {
                      handleCheckboxChange('duration', value);
                    }}
                  />
                </View>
              </View>
              <View style={style.pFormCheckboxContainer}>
                <View style={style.pFormToggle}>
                  <Text style={style.pFormSettingsText}>
                    Result visible to attendees
                  </Text>
                  <Toggle
                    isEnabled={form.share}
                    toggleSwitch={value => {
                      handleCheckboxChange('share', value);
                    }}
                  />
                </View>
              </View>
              <View style={style.pFormCheckboxContainer}>
                <View style={style.pFormToggle}>
                  <Text style={style.pFormSettingsText}>
                    Result visible to cohosts
                  </Text>
                  <Toggle
                    isEnabled={form.share}
                    toggleSwitch={value => {
                      handleCheckboxChange('share', value);
                    }}
                  />
                </View>
              </View>
              <View style={style.pFormCheckboxContainer}>
                <View style={style.pFormToggle}>
                  <Text style={style.pFormSettingsText}>Anonymous Results</Text>
                  <Toggle
                    isEnabled={form.share}
                    toggleSwitch={value => {
                      handleCheckboxChange('share', value);
                    }}
                  />
                </View>
              </View>
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
  pForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  pFormSection: {
    gap: 8,
  },
  pFormSettings: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_2_COLOR,
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
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 16,
    fontWeight: '400',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    height: 60,
    outlineStyle: 'none',
    padding: 20,
  },
  pFormOptionText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 24,
    fontWeight: '400',
  },
  pFormOptionPrefix: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
    paddingRight: 4,
  },
  pFormOptionLink: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    height: 48,
    paddingVertical: 12,
  },
  pFormOptions: {
    gap: 8,
  },
  pFormInput: {
    flex: 1,
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 24,
    fontWeight: '400',
    outlineStyle: 'none',
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 8,
    paddingVertical: 12,
    height: 48,
  },
  pFormSettingsText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 12,
    fontWeight: '400',
  },
  pFormOptionCard: {
    display: 'flex',
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 4,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderRadius: 8,
    borderWidth: 1,
  },
  pFormToggle: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  verticalPadding: {
    paddingVertical: 12,
  },
  pFormCheckboxContainer: {
    // paddingHorizontal: 12,
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
    lineHeight: 12,
    fontWeight: '400',
    paddingTop: 5,
  },
  pushRight: {
    marginLeft: 'auto',
  },
});

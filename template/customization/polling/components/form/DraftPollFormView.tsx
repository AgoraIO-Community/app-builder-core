import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {
  BaseModalTitle,
  BaseModalContent,
  BaseModalActions,
  BaseModalCloseIcon,
} from '../../ui/BaseModal';
import {
  IconButton,
  PrimaryButton,
  ThemeConfig,
  $config,
  TertiaryButton,
  ImageIcon,
  PlatformWrapper,
} from 'customization-api';
import {PollFormErrors, PollItem, PollKind} from '../../context/poll-context';
import {nanoid} from 'nanoid';
import BaseButtonWithToggle from '../../ui/BaseButtonWithToggle';

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
  onSave: (launch?: boolean) => void;
  errors: Partial<PollFormErrors>;
  onClose: () => void;
}

// Define the form action types and reducer for state management
const formReducer = (
  state: PollItem,
  action: {type: string; payload?: any},
) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {...state, [action.payload.field]: action.payload.value};
    case 'UPDATE_OPTION':
      return {
        ...state,
        options: state.options?.map((option, index) =>
          index === action.payload.index
            ? {...option, ...action.payload.option}
            : option,
        ),
      };
    case 'ADD_OPTION':
      return {
        ...state,
        options: [
          ...(state.options || []),
          {text: '', value: '', votes: [], percent: '0'},
        ],
      };
    case 'DELETE_OPTION':
      return {
        ...state,
        options:
          state.options?.filter((_, index) => index !== action.payload.index) ||
          [],
      };
    default:
      return state;
  }
};

export default function DraftPollFormView({
  form,
  setForm,
  onPreview,
  errors,
  onClose,
  onSave,
}: Props) {
  const handleInputChange = (field: string, value: string | boolean) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleCheckboxChange = (field: keyof PollItem, value: boolean) => {
    if (field === 'anonymous' && value) {
      setForm({
        ...form,
        [field]: value,
        share_attendee: false,
        share_host: false,
      });
      return;
    } else if (field === 'share_attendee' || field === 'share_host') {
      if (value) {
        setForm({
          ...form,
          [field]: value,
          anonymous: false,
        });
        return;
      }
    }
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
      setForm(prevForm => ({
        ...prevForm,
        options: prevForm.options?.map((option, i) => {
          if (i === index) {
            const text = value;
            const lowerText = text
              .replace(/\s+/g, '-')
              .toLowerCase()
              .concat('-')
              .concat(nanoid(2));
            return {
              ...option,
              text: text,
              value: lowerText,
            };
          }
          return option;
        }),
      }));
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
                id="question"
                autoComplete="off"
                style={[
                  style.pFormTextarea,
                  errors?.question ? style.errorBorder : {},
                ]}
                multiline={true}
                numberOfLines={4}
                value={form.question || ''}
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
              <View style={style.pFormTitleRow}>
                <FormTitle title="Responses" />
                <View style={style.pushRight}>
                  <View style={style.pFormToggle}>
                    <BaseButtonWithToggle
                      key="multiple-response-toggle"
                      text="Allow Multiple Selections"
                      value={form.multiple_response}
                      onPress={value => {
                        handleCheckboxChange('multiple_response', value);
                      }}
                    />
                  </View>
                </View>
              </View>
              <View style={style.pFormOptions}>
                {form.options?.map((option, index) => (
                  <View style={style.pFormOptionCard} key={index}>
                    <View style={style.pFormOptionPrefix}>
                      <ImageIcon
                        iconType="plain"
                        name={form.multiple_response ? 'square' : 'circle'}
                        iconSize={24}
                        tintColor={$config.FONT_COLOR}
                      />
                    </View>
                    <TextInput
                      autoComplete="off"
                      id="input"
                      style={style.pFormInput}
                      value={option.text}
                      onChangeText={(text: string) => {
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
                            updateFormOption('delete', '', index);
                          }}
                        />
                      </View>
                    ) : (
                      <></>
                    )}
                  </View>
                ))}
                {form.options?.length < 5 ? (
                  <PlatformWrapper>
                    {(isHovered: boolean) => (
                      <TouchableOpacity
                        style={[
                          style.pFormOptionCard,
                          style.noBorder,
                          isHovered ? style.hoverBorder : {},
                        ]}
                        onPress={() => {
                          updateFormOption('add', '', -1);
                        }}>
                        <Text
                          style={{
                            ...style.pFormOptionText,
                            ...style.pFormOptionLink,
                          }}>
                          + Add option
                        </Text>
                      </TouchableOpacity>
                    )}
                  </PlatformWrapper>
                ) : (
                  <></>
                )}
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
                  <View style={style.pFormOptionPrefix}>
                    <ImageIcon
                      iconType="plain"
                      name={'circle'}
                      iconSize={24}
                      tintColor={$config.FONT_COLOR}
                    />
                  </View>
                  <Text style={style.pFormOptionText}>Yes</Text>
                </View>
                <View style={[style.pFormOptionCard, style.verticalPadding]}>
                  <View style={style.pFormOptionPrefix}>
                    <ImageIcon
                      iconType="plain"
                      name={'circle'}
                      iconSize={24}
                      tintColor={$config.FONT_COLOR}
                    />
                  </View>
                  <Text style={style.pFormOptionText}>No</Text>
                </View>
              </View>
            </View>
          ) : (
            <></>
          )}
        </View>
      </BaseModalContent>
      <BaseModalActions>
        <View style={style.previewActions}>
          <View>
            <TertiaryButton
              containerStyle={style.btnContainer}
              text="Save for later"
              disabled={!form.question?.trim()}
              onPress={() => {
                try {
                  onSave(false);
                } catch (error) {
                  console.error('Error saving form:', error);
                }
              }}
            />
          </View>
          <View>
            <PrimaryButton
              containerStyle={style.btnContainer}
              text="Preview"
              disabled={!form.question?.trim()}
              textStyle={style.btnText}
              onPress={() => {
                try {
                  onPreview();
                } catch (error) {
                  console.error('Error previewing form:', error);
                }
              }}
            />
          </View>
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
  pFormTitleRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 4,
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderRadius: 8,
    borderWidth: 1,
  },
  noBorder: {
    borderColor: 'transparent',
  },
  pFormToggle: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    position: 'relative',
  },
  verticalPadding: {
    paddingVertical: 12,
  },
  pFormCheckboxContainer: {},
  previewActions: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  btnContainer: {
    minWidth: 150,
    height: 36,
    borderRadius: 4,
  },
  btnText: {
    color: $config.PRIMARY_ACTION_TEXT_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  errorBorder: {
    borderColor: $config.SEMANTIC_ERROR,
  },
  hoverBorder: {
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
  },
  errorText: {
    color: $config.SEMANTIC_ERROR,
    fontSize: ThemeConfig.FontSize.tiny,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 12,
    fontWeight: '400',
    paddingTop: 8,
    paddingLeft: 8,
  },
  pushRight: {
    marginLeft: 'auto',
  },
});

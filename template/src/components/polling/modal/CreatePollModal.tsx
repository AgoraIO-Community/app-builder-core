import {Text, View, StyleSheet, TextInput} from 'react-native';
import React from 'react';
import {
  BaseModal,
  BaseModalTitle,
  BaseModalContent,
  BaseModalActions,
} from './BaseModal';
import ThemeConfig from '../../../theme';
import LinkButton from '../../../atoms/LinkButton';
import Checkbox from '../../../atoms/Checkbox';
import IconButton from '../../../atoms/IconButton';
import PrimaryButton from '../../../atoms/PrimaryButton';
import {
  PollFormActionKind,
  PollKind,
  usePollForm,
} from '../context/poll-form-context';

function FormTitle({title}: {title: string}) {
  return (
    <View>
      <Text style={style.pFormTitle}>{title}</Text>
    </View>
  );
}
export default function CreatePollModal({visible}) {
  const {state, dispatch} = usePollForm();
  const {form} = state;

  return (
    <BaseModal visible={visible}>
      <BaseModalTitle title={form.title} />
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
                  if (text.trim() === '') {
                    return;
                  }
                  dispatch({
                    type: PollFormActionKind.UPDATE_FORM_FIELD,
                    payload: {
                      field: 'question',
                      value: text,
                    },
                  });
                }}
                placeholder="Enter poll question here..."
                placeholderTextColor={
                  $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low
                }
              />
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
                            dispatch({
                              type: PollFormActionKind.UPDATE_FORM_OPTION,
                              payload: {
                                value: text,
                                index: index,
                              },
                            });
                          }}
                          placeholder="Add text here..."
                          placeholderTextColor={
                            $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low
                          }
                        />
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
                              dispatch({
                                type: PollFormActionKind.DELETE_FORM_OPTION,
                                payload: {
                                  index: index,
                                },
                              });
                            }}
                          />
                        </View>
                      </View>
                    ))}
                    <View style={style.pFormAddOptionLinkSection}>
                      <LinkButton
                        text="Add option"
                        textStyle={style.pFormOptionLink}
                        onPress={() => {
                          dispatch({
                            type: PollFormActionKind.ADD_FORM_OPTION,
                          });
                        }}
                      />
                    </View>
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
              <View style={style.pFormCheckboxContainer}>
                {form.type === PollKind.MCQ ? (
                  <Checkbox
                    checked={form.multiple}
                    label={'Allow mutiple selections'}
                    labelStye={style.pFormOptionText}
                    onChange={() =>
                      dispatch({
                        type: PollFormActionKind.UPDATE_FORM_FIELD,
                        payload: {
                          field: 'multiple',
                          value: !form.multiple,
                        },
                      })
                    }
                  />
                ) : (
                  <></>
                )}
              </View>
              <View style={style.pFormCheckboxContainer}>
                <Checkbox
                  checked={form.share}
                  label={'Share results with the respondants'}
                  labelStye={style.pFormOptionText}
                  onChange={() =>
                    dispatch({
                      type: PollFormActionKind.UPDATE_FORM_FIELD,
                      payload: {
                        field: 'share',
                        value: !form.share,
                      },
                    })
                  }
                />
              </View>
              <View style={style.pFormCheckboxContainer}>
                <Checkbox
                  checked={form.duration}
                  label={'Set Timer Duration'}
                  labelStye={style.pFormOptionText}
                  onChange={() =>
                    dispatch({
                      type: PollFormActionKind.UPDATE_FORM_FIELD,
                      payload: {
                        field: 'duration',
                        value: !form.duration,
                      },
                    })
                  }
                />
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
              dispatch({
                type: PollFormActionKind.PREVIEW_FORM,
              });
            }}
            text="Preview"
          />
        </View>
      </BaseModalActions>
    </BaseModal>
  );
}

export const style = StyleSheet.create({
  createPollBox: {
    width: 620,
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
});

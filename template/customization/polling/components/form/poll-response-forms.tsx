import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useState} from 'react';
import {PollKind} from '../../context/poll-context';
import {
  ImageIcon,
  Checkbox,
  PrimaryButton,
  ThemeConfig,
  $config,
  useLocalUid,
} from 'customization-api';
import BaseRadioButton from '../../ui/BaseRadioButton';
import {
  PollOptionList,
  PollOptionInputListItem,
  PollItemFill,
} from '../poll-option-item-ui';
import PlatformWrapper from '../../../../src/utils/PlatformWrapper';
import {usePollPermissions} from '../../hook/usePollPermissions';
import {PollFormButton, PollFormInput} from '../../hook/usePollForm';

function PollResponseFormComplete() {
  return (
    <View style={[style.centerAlign, style.mediumHeight]}>
      <View>
        <ImageIcon
          iconType="plain"
          name="tick-fill"
          tintColor={$config.SEMANTIC_SUCCESS}
          iconSize={24}
        />
      </View>
      <View>
        <Text style={style.thankyouText}>Thank you for your response</Text>
      </View>
    </View>
  );
}

function PollRenderResponseFormBody(
  props: PollFormInput & {
    submitted: boolean;
  },
): JSX.Element {
  // Directly use switch case logic inside the render
  switch (props.pollItem.type) {
    // case PollKind.OPEN_ENDED:
    //   return (
    //     <PollResponseQuestionForm
    //       isFormFreezed={false} // TODO:SUP Based on poll timer
    //       pollItem={pollItem}
    //       onFormSubmit={onFormSubmit}
    //       hasUserResponded={hasUserResponded}
    //       onFormSubmitComplete={onFormSubmitComplete}
    //     />
    //   );
    case PollKind.MCQ:
    case PollKind.YES_NO:
      return <PollResponseMCQForm {...props} />;
    default:
      console.error('Unknown poll type:', props.pollItem.type);
      return <Text>Unknown poll type</Text>;
  }
}

function PollResponseQuestionForm() {
  const [answer, setAnswer] = useState('');

  return (
    <View style={style.optionsForm}>
      <View>
        <TextInput
          // editable={!isFormFreezed}
          autoComplete="off"
          style={style.pFormTextarea}
          multiline={true}
          numberOfLines={4}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Enter your response..."
          placeholderTextColor={
            $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low
          }
        />
      </View>
    </View>
  );
}

function PollResponseMCQForm({
  pollItem,
  selectedOptions,
  submitted,
  handleCheckboxToggle,
  selectedOption,
  handleRadioSelect,
}: Partial<PollFormInput> & {
  submitted: boolean;
}) {
  const {isPollCreator, canViewVotesPercent, canViewWhoVoted} =
    usePollPermissions({pollItem});
  const localUid = useLocalUid();
  return (
    <View style={style.optionsForm}>
      <PollOptionList>
        {pollItem.multiple_response
          ? pollItem.options?.map((option, index) => {
              const iVoted = option.votes.some(item => item.uid === localUid);
              const checked = selectedOptions.includes(option?.value) || iVoted;
              return (
                <TouchableWithoutFeedback disabled={submitted} key={index}>
                  <View pointerEvents={submitted ? 'none' : 'auto'}>
                    <PlatformWrapper>
                      {(isHovered: boolean) => (
                        <PollOptionInputListItem
                          index={index}
                          hovered={submitted ? false : isHovered}
                          checked={checked}>
                          <>
                            {/* Background fill according to vote percentage */}
                            {(isPollCreator || submitted) && (
                              <PollItemFill
                                canViewWhoVoted={canViewWhoVoted}
                                canViewVotesPercent={canViewVotesPercent}
                                iVoted={iVoted}
                                percent={option.percent}
                              />
                            )}
                            <Checkbox
                              key={index}
                              checked={checked}
                              label={option.text}
                              labelStye={style.optionText}
                              containerStyle={style.checkboxContainer}
                              checkBoxStyle={
                                submitted && checked
                                  ? style.checkboxSubmittedAndVoted
                                  : submitted && !checked
                                  ? style.checkboxSubmittedAndNotVoted
                                  : checked
                                  ? style.checkboxVoted
                                  : style.checkBox
                              }
                              tickColor={
                                submitted && checked
                                  ? $config.FONT_COLOR
                                  : submitted && !checked
                                  ? $config.FONT_COLOR
                                  : checked
                                  ? $config.BACKGROUND_COLOR
                                  : $config.FONT_COLOR
                              }
                              onChange={() =>
                                handleCheckboxToggle(option?.value)
                              }
                            />
                          </>
                        </PollOptionInputListItem>
                      )}
                    </PlatformWrapper>
                  </View>
                </TouchableWithoutFeedback>
              );
            })
          : pollItem.options?.map((option, index) => {
              const iVoted = option.votes.some(item => item.uid === localUid);
              const checked = selectedOption === option.value || iVoted;
              return (
                <TouchableWithoutFeedback disabled={submitted} key={index}>
                  <View pointerEvents={submitted ? 'none' : 'auto'}>
                    <PlatformWrapper>
                      {(isHovered: boolean) => (
                        <PollOptionInputListItem
                          index={index}
                          checked={checked}
                          hovered={submitted ? false : isHovered}>
                          <>
                            {/* Background fill according to vote percentage */}
                            {(isPollCreator || submitted) && (
                              <PollItemFill
                                canViewWhoVoted={canViewWhoVoted}
                                canViewVotesPercent={canViewVotesPercent}
                                iVoted={checked}
                                percent={option.percent}
                              />
                            )}
                            <BaseRadioButton
                              option={{
                                label: option.text,
                                value: option.value,
                              }}
                              labelStyle={style.optionText}
                              checked={checked}
                              onChange={handleRadioSelect}
                              filledColor={
                                submitted && checked
                                  ? $config.FONT_COLOR
                                  : submitted && !checked
                                  ? null
                                  : checked
                                  ? $config.PRIMARY_ACTION_BRAND_COLOR
                                  : null
                              }
                              tickColor={
                                submitted && checked
                                  ? $config.PRIMARY_ACTION_BRAND_COLOR
                                  : submitted && !checked
                                  ? null
                                  : checked
                                  ? $config.BACKGROUND_COLOR
                                  : null
                              }
                            />
                          </>
                        </PollOptionInputListItem>
                      )}
                    </PlatformWrapper>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
      </PollOptionList>
    </View>
  );
}

function PollFormSubmitButton({
  buttonText,
  submitDisabled,
  onSubmit,
  buttonStatus,
}: Partial<PollFormButton>) {
  // Define the styles based on button states
  const getButtonColor = () => {
    switch (buttonStatus) {
      case 'initial':
        return {backgroundColor: $config.SEMANTIC_NEUTRAL};
      case 'selected':
        return {backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR};
      case 'submitting':
        return {
          backgroundColor: $config.PRIMARY_ACTION_BRAND_COLOR,
          opacity: 0.7,
        };
      case 'submitted':
        return {backgroundColor: $config.SEMANTIC_SUCCESS};
      default:
        return {};
    }
  };
  return (
    <PrimaryButton
      disabled={submitDisabled}
      containerStyle={[style.btnContainer, getButtonColor()]}
      textStyle={style.btnText}
      onPress={() => {
        if (buttonStatus === 'submitted') {
          return;
        } else {
          onSubmit();
        }
      }}
      text={buttonText}
    />
  );
}

export {
  PollResponseQuestionForm,
  PollResponseMCQForm,
  PollResponseFormComplete,
  PollRenderResponseFormBody,
  PollFormSubmitButton,
};

export const style = StyleSheet.create({
  optionsForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    width: '100%',
  },
  thankyouText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.medium,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 24,
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
    padding: 16,
  },
  responseActions: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnContainer: {
    minWidth: 150,
    height: 36,
    borderRadius: 4,
  },
  submittedBtn: {
    backgroundColor: $config.SEMANTIC_SUCCESS,
    cursor: 'default',
  },
  btnText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  optionListItem: {
    display: 'flex',
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: $config.CARD_LAYER_3_COLOR,
    backgroundColor: $config.CARD_LAYER_3_COLOR,
  },
  optionText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    lineHeight: 24,
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
  centerAlign: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mediumHeight: {
    height: 272,
  },
  checkboxContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    width: '100%',
  },
  checkBox: {
    borderColor: $config.FONT_COLOR,
  },
  checkboxVoted: {
    borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
    backgroundColor: $config.FONT_COLOR,
  },
  checkboxSubmittedAndVoted: {
    borderColor: $config.FONT_COLOR,
    backgroundColor: $config.FONT_COLOR,
  },
  checkboxSubmittedAndNotVoted: {
    borderColor: $config.FONT_COLOR,
  },
});

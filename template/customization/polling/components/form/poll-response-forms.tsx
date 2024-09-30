import {Text, View, StyleSheet, TextInput} from 'react-native';
import React, {useState} from 'react';
import {PollItem, PollKind} from '../../context/poll-context';
import PollTimer from '../PollTimer';
import {
  ImageIcon,
  Checkbox,
  PrimaryButton,
  ThemeConfig,
  $config,
} from 'customization-api';
import BaseRadioButton from '../../ui/BaseRadioButton';
import {PollOptionList, PollOptionInputListItem} from '../poll-option-item-ui';

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
        <Text style={style.heading4}>Thank you for your response</Text>
      </View>
    </View>
  );
}

interface PollResponseFormProps {
  pollItem: PollItem;
  isFormFreezed: boolean;
  onComplete: (responses: string | string[]) => void;
}

function PollRenderResponseForm({
  pollItem,
  onFormComplete,
}: {
  pollItem: PollItem;
  onFormComplete: (responses: string | string[]) => void;
}): JSX.Element {
  return (
    <>
      <Text style={style.heading4}>{pollItem.question}</Text>
      <PollRenderResponseFormBody
        pollItem={pollItem}
        onFormComplete={onFormComplete}
      />
    </>
  );
}

function PollRenderResponseFormBody({
  pollItem,
  onFormComplete,
}: {
  pollItem: PollItem;
  onFormComplete: (responses: string | string[]) => void;
}): JSX.Element {
  // Directly use switch case logic inside the render
  switch (pollItem.type) {
    case PollKind.OPEN_ENDED:
      return (
        <PollResponseQuestionForm
          isFormFreezed={false} // TODO:SUP Based on poll timer
          pollItem={pollItem}
          onComplete={onFormComplete}
        />
      );
    case PollKind.MCQ:
    case PollKind.YES_NO:
      return (
        <PollResponseMCQForm
          isFormFreezed={false} // TODO:SUP Based on poll timer
          pollItem={pollItem}
          onComplete={onFormComplete}
        />
      );
    default:
      console.error('Unknown poll type:', pollItem.type);
      return <Text>Unknown poll type</Text>;
  }
}

function PollResponseQuestionForm({
  pollItem,
  isFormFreezed,
  onComplete,
}: PollResponseFormProps) {
  const [answer, setAnswer] = useState('');

  return (
    <View>
      <View>
        <TextInput
          editable={!isFormFreezed}
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
      <View>
        <PrimaryButton
          disabled={isFormFreezed}
          containerStyle={style.btnContainer}
          textStyle={style.btnText}
          onPress={() => {
            if (!answer || answer.trim() === '') {
              return;
            }
            onComplete(answer);
          }}
          text="Submit"
        />
      </View>
    </View>
  );
}

function PollResponseMCQForm({
  pollItem,
  isFormFreezed,
  onComplete,
}: PollResponseFormProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleCheckboxToggle = (value: string) => {
    setSelectedOptions(prevSelectedOptions => {
      if (prevSelectedOptions.includes(value)) {
        return prevSelectedOptions.filter(option => option !== value);
      } else {
        return [...prevSelectedOptions, value];
      }
    });
  };

  const handleRadioSelect = (option: string) => {
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (pollItem.multiple_response) {
      if (selectedOptions.length === 0) {
        return;
      }
      onComplete(selectedOptions);
    } else {
      if (!selectedOption) {
        return;
      }
      onComplete([selectedOption]);
    }
  };

  return (
    <View style={style.optionsForm}>
      <PollOptionList>
        {pollItem.multiple_response
          ? pollItem.options?.map((option, index) => (
              <PollOptionInputListItem index={index} key={index}>
                <Checkbox
                  key={index}
                  checked={selectedOptions.includes(option?.value)}
                  label={option.text}
                  labelStye={style.optionText}
                  onChange={() => handleCheckboxToggle(option?.value)}
                />
              </PollOptionInputListItem>
            ))
          : pollItem.options?.map((option, index) => (
              <PollOptionInputListItem index={index} key={index}>
                <BaseRadioButton
                  option={{
                    label: option.text,
                    value: option.value,
                  }}
                  labelStyle={style.optionText}
                  checked={selectedOption === option.value}
                  onChange={handleRadioSelect}
                />
              </PollOptionInputListItem>
            ))}
      </PollOptionList>
      <View style={style.responseActions}>
        <PrimaryButton
          disabled={isFormFreezed}
          containerStyle={style.btnContainer}
          textStyle={style.btnText}
          onPress={handleSubmit}
          text="Submit"
        />
      </View>
    </View>
  );
}

export {
  PollResponseQuestionForm,
  PollResponseMCQForm,
  PollResponseFormComplete,
  PollRenderResponseForm,
  PollRenderResponseFormBody,
};

export const style = StyleSheet.create({
  optionsForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    width: '100%',
  },
  heading4: {
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
    width: '100%',
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
});

import {Text, View, StyleSheet, TextInput} from 'react-native';
import React, {useState} from 'react';
import {BaseModalContent, BaseModalActions} from '../../ui/BaseModal';
import {PollItem} from '../../context/poll-context';
import PollTimer from '../PollTimer';
import {
  ImageIcon,
  Checkbox,
  Spacer,
  PrimaryButton,
  ThemeConfig,
} from 'customization-api';
import BaseRadioButton from '../../ui/BaseRadioButton';

function PollResponseFormComplete() {
  return (
    <BaseModalContent>
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
    </BaseModalContent>
  );
}

interface PollResponseFormProps {
  pollItem: PollItem;
  onComplete: (responses: string | string[]) => void;
}

function PollRenderResponseForm({
  pollItem,
  onFormComplete,
}: {
  pollItem: PollItem;
  onFormComplete: (responses: string | string[]) => void;
}): JSX.Element {
  switch (pollItem.type) {
    case 'OPEN_ENDED':
      return (
        <PollResponseQuestionForm
          pollItem={pollItem}
          onComplete={onFormComplete}
        />
      );
    case 'MCQ':
    case 'YES_NO':
      return (
        <PollResponseMCQForm pollItem={pollItem} onComplete={onFormComplete} />
      );
    default:
      return <></>;
  }
}

function PollResponseQuestionForm({
  pollItem,
  onComplete,
}: PollResponseFormProps) {
  const [answer, setAnswer] = useState('');
  const [isFormFreezed, setFreezeForm] = useState<boolean>(false);

  return (
    <>
      <BaseModalContent>
        {pollItem.duration ? (
          <PollTimer
            expiresAt={pollItem.expiresAt}
            setFreezeForm={setFreezeForm}
          />
        ) : (
          <></>
        )}
        <Text style={style.heading4}>{pollItem.question}</Text>
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
      </BaseModalContent>
      <BaseModalActions>
        <View style={style.responseActions}>
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
      </BaseModalActions>
    </>
  );
}

function PollResponseMCQForm({pollItem, onComplete}: PollResponseFormProps) {
  const [isFormFreezed, setFreezeForm] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

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
    if (selectedOptions.length === 0 && !selectedOption) {
      return;
    }
    if (pollItem.multiple_response) {
      onComplete(selectedOptions);
    } else {
      onComplete(selectedOption);
    }
  };

  return (
    <BaseModalContent>
      <View>
        {pollItem.duration ? (
          <>
            <PollTimer
              expiresAt={pollItem.expiresAt}
              setFreezeForm={setFreezeForm}
            />
            <Spacer horizontal={true} size={8} />
          </>
        ) : (
          <></>
        )}
        <Text style={style.heading4}>{pollItem.question}</Text>
      </View>
      <View>
        <View style={style.optionsSection}>
          {pollItem.multiple_response
            ? pollItem.options.map((option, index) => (
                <View style={style.optionCard} key={index}>
                  <Checkbox
                    key={index}
                    checked={selectedOptions.includes(option.value)}
                    label={option.text}
                    labelStye={style.optionCardText}
                    onChange={() => handleCheckboxToggle(option.value)}
                  />
                </View>
              ))
            : pollItem.options.map((option, index) => (
                <View style={style.optionCard} key={index}>
                  <BaseRadioButton
                    option={{
                      label: option.text,
                      value: option.value,
                    }}
                    labelStyle={style.optionCardText}
                    checked={selectedOption === option.value}
                    onChange={handleRadioSelect}
                  />
                </View>
              ))}
        </View>
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
    </BaseModalContent>
  );
}

export {
  PollResponseQuestionForm,
  PollResponseMCQForm,
  PollResponseFormComplete,
  PollRenderResponseForm,
};

export const style = StyleSheet.create({
  titleCard: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  titleAvatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: $config.VIDEO_AUDIO_TILE_AVATAR_COLOR,
  },
  titleAvatarContainerText: {
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
    fontWeight: '600',
    color: $config.VIDEO_AUDIO_TILE_COLOR,
  },
  titleText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontWeight: '700',
    lineHeight: 20,
  },
  titleSubtext: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.tiny,
    fontWeight: '400',
    lineHeight: 16,
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
  optionsSection: {
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 9,
    marginBottom: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    paddingVertical: 8,
  },
  optionCard: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  optionCardText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    lineHeight: 24,
  },
  //   pFormOptionText: {
  //     color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
  //     fontSize: ThemeConfig.FontSize.small,
  //     fontFamily: ThemeConfig.FontFamily.sansPro,
  //     lineHeight: 16,
  //     fontWeight: '400',
  //   },
  //   pFormOptionPrefix: {
  //     color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.low,
  //     paddingRight: 4,
  //   },
  //   pFormOptionLink: {
  //     fontWeight: '400',
  //     lineHeight: 24,
  //   },
  //   pFormOptions: {
  //     paddingVertical: 8,
  //     gap: 8,
  //   },
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
  //   pFormOptionCard: {
  //     display: 'flex',
  //     paddingHorizontal: 16,
  //     flexDirection: 'row',
  //     justifyContent: 'flex-start',
  //     alignItems: 'center',
  //     alignSelf: 'stretch',
  //     gap: 8,
  //     backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
  //     borderRadius: 9,
  //   },
  //   verticalPadding: {
  //     paddingVertical: 12,
  //   },
  //   pFormCheckboxContainer: {
  //     paddingHorizontal: 16,
  //     paddingVertical: 8,
  //   },
  //   previewActions: {
  //     flex: 1,
  //     display: 'flex',
  //     flexDirection: 'row',
  //     alignItems: 'center',
  //     justifyContent: 'flex-end',
  //   },
  //   btnContainer: {
  //     minWidth: 150,
  //     height: 36,
  //     borderRadius: 4,
  //   },
  //   btnText: {
  //     color: $config.FONT_COLOR,
  //     fontSize: ThemeConfig.FontSize.small,
  //     fontFamily: ThemeConfig.FontFamily.sansPro,
  //     fontWeight: '600',
  //     textTransform: 'capitalize',
  //   },
});

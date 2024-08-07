import {Text, View, StyleSheet, TextInput} from 'react-native';
import React, {useState} from 'react';
import {BaseModalContent, BaseModalActions} from '../../ui/BaseModal';
import ThemeConfig from '../../../../theme';
import PrimaryButton from '../../../../atoms/PrimaryButton';
import {PollItem, usePoll} from '../../context/poll-context';

interface Props {
  pollItem: PollItem;
}

function PollResponseQuestionForm({pollItem}: Props) {
  console.log('supriya pollItem: ', pollItem);
  const [answer, setAnswer] = useState('');
  const {onSubmitPollResponse} = usePoll();

  return (
    <>
      <BaseModalContent>
        <Text style={style.timer}>{'2.45'}</Text>
        <Text style={style.questionText}>{pollItem.question}</Text>
        <View>
          <TextInput
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
            containerStyle={style.btnContainer}
            textStyle={style.btnText}
            onPress={() => {
              onSubmitPollResponse(pollItem, answer);
            }}
            text="Submit"
          />
        </View>
      </BaseModalActions>
    </>
  );
}

export {PollResponseQuestionForm};
export const style = StyleSheet.create({
  timer: {
    color: $config.SEMANTIC_WARNING,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 16,
    lineHeight: 20,
    paddingBottom: 12,
  },
  questionText: {
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

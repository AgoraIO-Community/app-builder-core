import {Text, View, StyleSheet, TextInput} from 'react-native';
import React, {useState} from 'react';
import {BaseModalContent, BaseModalActions} from '../../ui/BaseModal';
import ThemeConfig from '../../../../theme';
import PrimaryButton from '../../../../atoms/PrimaryButton';
import {PollItem, usePoll} from '../../context/poll-context';
import PollTimer from '../PollTimer';
import {videoRoomUserFallbackText} from '../../../../language/default-labels/videoCallScreenLabels';
import {useContent} from 'customization-api';
import {UidType} from '../../../../../agora-rn-uikit/src';
import {useString} from '../../../../utils/useString';
import UserAvatar from '../../../../atoms/UserAvatar';
import ImageIcon from '../../../../atoms/ImageIcon';

interface Props {
  pollItem: PollItem;
}

function PollResponseFormModalTitle({pollItem}: Props) {
  const remoteUserDefaultLabel = useString(videoRoomUserFallbackText)();
  const {defaultContent} = useContent();
  const getPollCreaterName = (uid: UidType) => {
    return defaultContent[uid]?.name || remoteUserDefaultLabel;
  };

  return (
    <View style={style.titleCard}>
      <View style={style.titleAvatar}>
        <UserAvatar
          name={getPollCreaterName(pollItem.createdBy)}
          containerStyle={style.titleAvatarContainer}
          textStyle={style.titleAvatarContainerText}
        />
      </View>
      <View style={style.title}>
        <Text style={style.titleText}>
          {getPollCreaterName(pollItem.createdBy)}
        </Text>
        <Text style={style.titleSubtext}>{pollItem.type}</Text>
      </View>
    </View>
  );
}

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
  onComplete: () => void;
}

function PollResponseQuestionForm({
  pollItem,
  onComplete,
}: PollResponseFormProps) {
  const [answer, setAnswer] = useState('');
  const {onSubmitPollResponse} = usePoll();

  return (
    <>
      <BaseModalContent>
        <PollTimer expiresAt={pollItem.expiresAt} />
        <Text style={style.heading4}>{pollItem.question}</Text>
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
              try {
                onSubmitPollResponse(pollItem, answer);
                onComplete();
              } catch (error) {
                console.error('error: ', error);
              }
            }}
            text="Submit"
          />
        </View>
      </BaseModalActions>
    </>
  );
}

export {
  PollResponseQuestionForm,
  PollResponseFormModalTitle,
  PollResponseFormComplete,
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

import {Text, StyleSheet, View} from 'react-native';
import React from 'react';
import {BaseModal, BaseModalTitle} from '../../ui/BaseModal';
import ThemeConfig from '../../../../theme';
import UserAvatar from '../../../../atoms/UserAvatar';
// import RadioButton from '../../ui/RadioButton';
import {PollResponseQuestionForm} from '../form/poll-response-forms';
import {PollKind, usePoll} from '../../context/poll-context';
import {videoRoomUserFallbackText} from '../../../../language/default-labels/videoCallScreenLabels';
import {useContent} from 'customization-api';
import {UidType} from '../../../../../agora-rn-uikit/src';
import {useString} from '../../../../utils/useString';

export default function PollResponseFormModal() {
  const {polls, launchPollId} = usePoll();
  const poll = polls[launchPollId];

  const remoteUserDefaultLabel = useString(videoRoomUserFallbackText)();
  const {defaultContent} = useContent();
  const getPollCreaterName = (uid: UidType) => {
    return defaultContent[uid]?.name || remoteUserDefaultLabel;
  };

  function renderSwitch(type: PollKind) {
    switch (type) {
      case PollKind.OPEN_ENDED:
        return <PollResponseQuestionForm pollItem={poll} />;
      // case PollKind.OPEN_ENDED:
      //   return (
      //     <CreatePollFormView
      //       form={form}
      //       setForm={setForm}
      //       setCurrentStep={setCurrentStep}
      //     />
      //   );
      // case PollKind.YES_NO:
      //   return (
      //     <PollPreviewFormView form={form} onEdit={onEdit} onSave={onSave} />
      //   );
      default:
        return <></>;
    }
  }

  return (
    <BaseModal visible={true}>
      <BaseModalTitle>
        <View style={style.titleCard}>
          <View style={style.titleAvatar}>
            <UserAvatar
              name={getPollCreaterName(poll.createdBy)}
              containerStyle={style.titleAvatarContainer}
              textStyle={style.titleAvatarContainerText}
            />
          </View>
          <View style={style.title}>
            <Text style={style.titleText}>
              {getPollCreaterName(poll.createdBy)}
            </Text>
            <Text style={style.titleSubtext}>hh:mm pm {poll.type}</Text>
          </View>
        </View>
      </BaseModalTitle>
      {renderSwitch(poll.type)}
    </BaseModal>
  );
}

export const style = StyleSheet.create({
  timer: {
    color: $config.SEMANTIC_WARNING,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontSize: 16,
    lineHeight: 20,
    paddingBottom: 12,
  },
  shareBox: {
    width: 550,
  },
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
  questionText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.medium,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 24,
    fontWeight: '600',
  },
  responseSection: {
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderRadius: 9,
    paddingVertical: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginVertical: 20,
  },
  responseCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  responseCardBody: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  responseText: {
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    lineHeight: 24,
  },
});

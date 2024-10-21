import {Text, StyleSheet, View} from 'react-native';
import React from 'react';
import {
  BaseModal,
  BaseModalTitle,
  BaseModalContent,
  BaseModalCloseIcon,
  BaseModalActions,
} from '../../ui/BaseModal';
import {
  ThemeConfig,
  $config,
  TertiaryButton,
  PrimaryButton,
} from 'customization-api';
import {PollTaskRequestTypes, usePoll} from '../../context/poll-context';

interface PollConfirmModalProps {
  pollId: string;
  actionType: 'end' | 'delete'; // Define the type of action (end or delete)
}

export default function PollConfirmModal({
  pollId,
  actionType,
}: PollConfirmModalProps) {
  const {handlePollTaskRequest, closeCurrentModal} = usePoll();

  const modalTitle = actionType === 'end' ? 'End Poll?' : 'Delete Poll?';
  const description =
    actionType === 'end'
      ? 'This will stop the poll for everyone in this call.'
      : 'This will permanently delete the poll and its results. This action cannot be undone.';

  const confirmButtonText =
    actionType === 'end' ? 'End for all' : 'Delete Poll';

  return (
    <BaseModal visible={true} onClose={closeCurrentModal}>
      <BaseModalTitle title={modalTitle}>
        <BaseModalCloseIcon onClose={closeCurrentModal} />
      </BaseModalTitle>
      <BaseModalContent noPadding>
        <View style={style.section}>
          <Text style={style.descriptionText}>{description}</Text>
        </View>
      </BaseModalContent>
      <BaseModalActions alignRight>
        <View>
          <TertiaryButton
            containerStyle={style.btnContainer}
            text="Close"
            onPress={closeCurrentModal}
          />
        </View>
        <View>
          <PrimaryButton
            containerStyle={[
              style.btnContainer,
              {backgroundColor: $config.SEMANTIC_ERROR},
            ]}
            text={confirmButtonText}
            textStyle={style.btnText}
            onPress={() => {
              if (actionType === 'delete') {
                handlePollTaskRequest(PollTaskRequestTypes.DELETE, pollId);
              }
              if (actionType === 'end') {
                handlePollTaskRequest(PollTaskRequestTypes.FINISH, pollId);
              }
            }}
          />
        </View>
      </BaseModalActions>
    </BaseModal>
  );
}

export const style = StyleSheet.create({
  section: {
    padding: 20,
    paddingBottom: 60,
  },
  descriptionText: {
    color: $config.FONT_COLOR + ThemeConfig.EmphasisPlus.high,
    fontSize: ThemeConfig.FontSize.normal,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    lineHeight: 20,
    fontWeight: '400',
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
  textCenter: {
    textAlign: 'center',
  },
});

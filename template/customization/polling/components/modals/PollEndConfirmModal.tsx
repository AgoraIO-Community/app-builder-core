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

export default function PollEndConfirmModal({pollId}: {pollId: string}) {
  const {handlePollTaskRequest, closeCurrentModal} = usePoll();

  return (
    <BaseModal visible={true} onClose={closeCurrentModal}>
      <BaseModalTitle title="End Poll?">
        <BaseModalCloseIcon onClose={closeCurrentModal} />
      </BaseModalTitle>
      <BaseModalContent noPadding>
        <View style={style.section}>
          <Text style={style.descriptionText}>
            This will stop the poll for everyone in this call.
          </Text>
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
            text="End for all"
            textStyle={style.btnText}
            onPress={() => {
              handlePollTaskRequest(PollTaskRequestTypes.FINISH, pollId);
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
    color: $config.FONT_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  textCenter: {
    textAlign: 'center',
  },
});

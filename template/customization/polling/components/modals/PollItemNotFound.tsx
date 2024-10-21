import React from 'react';
import {Text} from 'react-native';
import {
  BaseModal,
  BaseModalTitle,
  BaseModalCloseIcon,
  BaseModalContent,
} from '../../ui/BaseModal';
import {usePoll} from '../../context/poll-context';
import {$config} from 'customization-api';

export default function PollItemNotFound() {
  const {closeCurrentModal} = usePoll();

  return (
    <BaseModal visible={true} onClose={closeCurrentModal}>
      <BaseModalTitle title="Poll Removed">
        <BaseModalCloseIcon onClose={closeCurrentModal} />
      </BaseModalTitle>
      <BaseModalContent>
        <Text style={{color: $config.FONT_COLOR}}>
          This poll has been deleted by the host. Your response was not
          submitted.
        </Text>
      </BaseModalContent>
    </BaseModal>
  );
}

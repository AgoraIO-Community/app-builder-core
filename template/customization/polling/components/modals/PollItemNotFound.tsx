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
      <BaseModalTitle title="No poll found">
        <BaseModalCloseIcon onClose={closeCurrentModal} />
      </BaseModalTitle>
      <BaseModalContent>
        <Text style={{color: $config.FONT_COLOR}}>
          Invalid pollId or Poll data is not available or invalid.
        </Text>
      </BaseModalContent>
    </BaseModal>
  );
}

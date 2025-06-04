import React, {SetStateAction, Dispatch} from 'react';
import {View, StyleSheet} from 'react-native';
import {useString} from '../../utils/useString';
import {textTrackModalTitleIntn} from '../../language/default-labels/videoCallScreenLabels';
import GenericModal from '../common/GenericModal';
import TextTracksTable from './TextTracksTable';

interface ViewTextTracksModalProps {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function ViewTextTracksModal(props: ViewTextTracksModalProps) {
  const {setModalOpen} = props;

  const textTrackModalTitle = useString(textTrackModalTitleIntn)();

  return (
    <GenericModal
      visible={true}
      onRequestClose={() => setModalOpen(false)}
      showCloseIcon={true}
      title={textTrackModalTitle}
      cancelable={false}
      contentContainerStyle={style.contentContainer}>
      <View style={style.fullBody}>
        <TextTracksTable />
      </View>
    </GenericModal>
  );
}

const style = StyleSheet.create({
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexShrink: 0,
    width: '100%',
  },
  fullBody: {
    width: '100%',
    flex: 1,
  },
});

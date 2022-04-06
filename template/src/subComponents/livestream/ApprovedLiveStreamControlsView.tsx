import React, {useContext} from 'react';
import {View} from 'react-native';
import RemoteLiveStreamApprovedRequestRecall from './controls/RemoteLiveStreamApprovedRequestRecall';
import LiveStreamContext, {requestStatus} from '../../components/livestream';
import {participantStylesInterface} from '../../components/ParticipantsView';

interface IProps {
  uid: number;
  participantStyles: participantStylesInterface;
}

const ApprovedLiveStreamControlsView = (props: IProps) => {
  const {uid, participantStyles} = props;
  const {currLiveStreamRequest} = useContext(LiveStreamContext);

  if (currLiveStreamRequest[uid]?.status === requestStatus.Approved) {
    return (
      <View style={[participantStyles.actionBtnIcon, {marginRight: 10}]}>
        <RemoteLiveStreamApprovedRequestRecall uid={uid} />
      </View>
    );
  }
  return <></>;
};

export default ApprovedLiveStreamControlsView;

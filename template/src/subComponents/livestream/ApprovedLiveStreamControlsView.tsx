import React, {useContext} from 'react';
import {View} from 'react-native';
import RemoteLiveStreamApprovedRequestRecall from './controls/RemoteLiveStreamApprovedRequestRecall';
import LiveStreamContext, {RaiseHandValue} from '../../components/livestream';
import {participantStylesInterface} from '../../components/ParticipantsView';
import chatContext from '../../components/ChatContext';
import {ClientRole} from '../../../agora-rn-uikit';

interface IProps {
  uid: number;
  participantStyles: participantStylesInterface;
}

const ApprovedLiveStreamControlsView = (props: IProps) => {
  const {uid, participantStyles} = props;
  const {raiseHandList} = useContext(LiveStreamContext);
  const {userList} = useContext(chatContext);

  if (
    raiseHandList[uid]?.raised === RaiseHandValue.TRUE &&
    userList[uid]?.role == ClientRole.Broadcaster
  ) {
    return (
      <View style={[participantStyles.actionBtnIcon, {marginRight: 10}]}>
        <RemoteLiveStreamApprovedRequestRecall uid={uid} />
      </View>
    );
  }
  return <></>;
};

export default ApprovedLiveStreamControlsView;

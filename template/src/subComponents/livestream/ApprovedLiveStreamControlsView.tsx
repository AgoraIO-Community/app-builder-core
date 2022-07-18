import React, {useContext} from 'react';
import {View} from 'react-native';
import RemoteLiveStreamApprovedRequestRecall from './controls/RemoteLiveStreamApprovedRequestRecall';
import LiveStreamContext, {RaiseHandValue} from '../../components/livestream';
import {ClientRole} from '../../../agora-rn-uikit';
import useUserList from '../../utils/useUserList';

const ApprovedLiveStreamControlsView = (props: {
  uid: number;
  p_styles: any;
}) => {
  const {uid, p_styles} = props;
  const {renderList} = useUserList();
  const {raiseHandList} = useContext(LiveStreamContext);

  if (
    raiseHandList[uid]?.raised === RaiseHandValue.TRUE &&
    renderList[uid]?.role == ClientRole.Broadcaster
  ) {
    return (
      <View style={[p_styles.actionBtnIcon, {marginRight: 10}]}>
        <RemoteLiveStreamApprovedRequestRecall uid={uid} />
      </View>
    );
  }
  return <></>;
};

export default ApprovedLiveStreamControlsView;

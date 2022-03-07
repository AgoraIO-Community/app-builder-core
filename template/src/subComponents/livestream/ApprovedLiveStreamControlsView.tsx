import React, {useContext} from 'react';
import {View} from 'react-native';
import RemoteLiveStreamApprovedRequestRecall from './controls/RemoteLiveStreamApprovedRequestRecall';
import LiveStreamContext, {requestStatus} from '../../components/livestream';

const ApprovedLiveStreamControlsView = (props: {
  uid: number;
  p_styles: any;
}) => {
  const {uid, p_styles} = props;
  const {currLiveStreamRequest} = useContext(LiveStreamContext);

  if (currLiveStreamRequest[uid]?.status === requestStatus.Approved) {
    return (
      <View style={[p_styles.actionBtnIcon, {marginRight: 10}]}>
        <RemoteLiveStreamApprovedRequestRecall uid={uid} />
      </View>
    );
  }
  return <></>;
};

export default ApprovedLiveStreamControlsView;

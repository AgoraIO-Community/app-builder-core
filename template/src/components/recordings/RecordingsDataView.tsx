import React from 'react';
import {Text, View, Linking} from 'react-native';
import Clipboard from '../../subComponents/Clipboard';
import {style} from './style';
// import Pagination from '../../atoms/pagination/Pagination';
import Loading from '../../subComponents/Loading';
import {getRecordedDate} from './utils';
import Tooltip from '../../atoms/Tooltip';
import Spacer from '../../atoms/Spacer';
import ImageIcon from '../../atoms/ImageIcon';

function RecordingsDateView({status, recordings, error, pagination}) {
  if (status === 'idle' || status === 'pending') {
    return <Loading background="transparent" text="Fetching recordings.." />;
  }
  if (status === 'rejected') {
    return (
      <Text style={[style.ttime, style.pt10, style.pl10]}>
        {error?.message}
      </Text>
    );
  }
  if (status === 'resolved' && recordings.length === 0) {
    return (
      <Text style={[style.ttime, style.pt10, style.pl10]}>
        No recordings found for this meeting
      </Text>
    );
  }
  return (
    <>
      <View style={style.tbody}>
        {recordings.map(item => (
          <View style={style.tbrow} key={item.id}>
            <View style={[style.td, style.plzero]}>
              <Text style={style.ttime}>
                {getRecordedDate(item.created_at)}
              </Text>
            </View>
            <View style={style.td}>
              <View style={style.tactions}>
                <Text
                  style={style.tlink}
                  onPress={async () => {
                    if (await Linking.canOpenURL(item.download_url)) {
                      await Linking.openURL(item.download_url);
                    }
                  }}>
                  View
                </Text>
                <View>
                  <Tooltip
                    isClickable
                    placement="right"
                    toolTipIcon={
                      <>
                        <ImageIcon
                          iconType="plain"
                          name="tick-fill"
                          tintColor={$config.SEMANTIC_SUCCESS}
                        />
                        <Spacer size={4} horizontal={true} />
                      </>
                    }
                    toolTipMessage="Link Copied"
                    onPress={() => {
                      Clipboard.setString(item.download_url);
                    }}
                    renderContent={(isToolTipVisible, setToolTipVisible) => {
                      return (
                        <Text
                          style={[style.tlink, style.pl10]}
                          onPress={() => {
                            Clipboard.setString(item.download_url);
                            setToolTipVisible(true);
                          }}>
                          Copy shareable link
                        </Text>
                      );
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
      {/* <View style={style.mfooter}>
        <Text style={style.mfooterTitle}>
          Showing {pagination?.total <= 10 ? pagination?.total : 10} of{' '}
          {pagination?.total}
        </Text>
        <View style={style.pushRight}>
        <View style={style.pagination}>
          <Pagination
            currentPage={1}
            totalCount={24}
            pageSize={10}
            onPageChange={page => console.log(page)}
          />
        </View>
        </View>
      </View> */}
    </>
  );
}

export default RecordingsDateView;

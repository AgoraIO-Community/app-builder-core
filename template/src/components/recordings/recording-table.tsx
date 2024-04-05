import React from 'react';
import {Text, View, ScrollView, Linking} from 'react-native';
import {style} from './style';
import Pagination from '../../atoms/pagination/Pagination';
import Clipboard from '../../subComponents/Clipboard';
import {downloadRecording, getRecordedDate} from './utils';
import Tooltip from '../../atoms/Tooltip';
import Spacer from '../../atoms/Spacer';
import ImageIcon from '../../atoms/ImageIcon';
import Loading from '../../subComponents/Loading';

function RTableHeader() {
  return (
    <View style={style.thead}>
      <View style={style.throw}>
        <View style={[style.th, style.plzero]}>
          <Text style={style.thText}>Date/time</Text>
        </View>
        <View style={style.th}>
          <Text style={style.thText}>Actions</Text>
        </View>
      </View>
    </View>
  );
}

function RTableBody({status, recordings}) {
  const renderTableBodyContent = () => {
    if (status === 'idle' || status === 'pending') {
      return <Loading background="transparent" text="Fetching recordings.." />;
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
        {recordings
          .filter(item => item.download_url)
          .map(item => (
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
                      if (await Linking.canOpenURL(item.download_url[0])) {
                        await Linking.openURL(item.download_url[0]);
                      }
                    }}>
                    View
                  </Text>
                  <Text
                    style={[style.tlink, style.pl15]}
                    onPress={() => {
                      downloadRecording(item.download_url[0]);
                    }}>
                    Download
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
                        Clipboard.setString(item.download_url[0]);
                      }}
                      renderContent={(isToolTipVisible, setToolTipVisible) => {
                        return (
                          <Text
                            style={[style.tlink, style.pl15]}
                            onPress={() => {
                              Clipboard.setString(item.download_url[0]);
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
      </>
    );
  };

  return (
    <ScrollView
      horizontal={true}
      contentContainerStyle={style.scrollgrow}
      showsVerticalScrollIndicator={false}>
      <View style={style.tbody}>{renderTableBodyContent()}</View>
    </ScrollView>
  );
}

function RTableFooter({currentPage, setCurrentPage, pagination}) {
  if (!pagination || (pagination && Object.keys(pagination).length === 0)) {
    return (
      <View style={style.mfooter}>
        <Text> </Text>
      </View>
    );
  }
  const limit = pagination?.limit || 10;
  const total = pagination?.total || 1;
  const showing =
    total <= limit
      ? total
      : limit * currentPage >= total
      ? total
      : limit * currentPage;

  return (
    <View style={style.mfooter}>
      <Text style={style.mfooterTitle}>
        Showing {showing} of {total}
      </Text>
      <View style={style.pushRight}>
        <View style={style.pagination}>
          <Pagination
            currentPage={currentPage}
            totalCount={pagination?.total}
            pageSize={pagination?.limit}
            onPageChange={(page: number) => setCurrentPage(page)}
          />
        </View>
      </View>
    </View>
  );
}

export {RTableHeader, RTableBody, RTableFooter};

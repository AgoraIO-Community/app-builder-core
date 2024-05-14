import React from 'react';
import {Text, View, ScrollView, Linking, TouchableOpacity} from 'react-native';
import {style} from './style';
import Pagination from '../../atoms/pagination/Pagination';
import Clipboard from '../../subComponents/Clipboard';
import {downloadRecording, getDuration, getRecordedDateTime} from './utils';
import Tooltip from '../../atoms/Tooltip';
import IconButtonWithToolTip from '../../atoms/IconButton';
import Loading from '../../subComponents/Loading';
import ImageIcon from '../../atoms/ImageIcon';
import Spacer from '../../atoms/Spacer';

function RTableHeader() {
  return (
    <View style={style.thead}>
      <View style={style.throw}>
        <View style={[style.th, style.plzero]}>
          <Text style={style.thText}>Date</Text>
        </View>
        <View style={[style.th]}>
          <Text style={style.thText}>Time</Text>
        </View>
        <View style={[style.th]}>
          <Text style={style.thText}>Duration</Text>
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
        <View style={style.infotextContainer}>
          <View>
            <ImageIcon
              iconType="plain"
              name="info"
              tintColor={'#777777'}
              iconSize={32}
            />
          </View>
          <View>
            <Text style={[style.infoText, style.pt10, style.pl10]}>
              No recordings found for this meeting
            </Text>
          </View>
        </View>
      );
    }
    return (
      <>
        {recordings.map(item => {
          const [date, time] = getRecordedDateTime(item.created_at);
          return (
            <View style={style.tbrow} key={item.id}>
              <View style={[style.td, style.plzero]}>
                <Text style={style.ttime}>{date}</Text>
              </View>
              <View style={[style.td]}>
                <Text style={style.ttime}>{time}</Text>
              </View>
              <View style={[style.td]}>
                <Text style={style.ttime}>
                  {getDuration(item.created_at, item.ended_at)}
                </Text>
              </View>
              <View style={(style.td, style.iconButtonContainer)}>
                {item?.download_url?.length > 0 ? (
                  item?.download_url?.map((link: string, i: number) => (
                    <View style={style.tactions} key={i}>
                      <View>
                        <IconButtonWithToolTip
                          hoverEffect={true}
                          hoverEffectStyle={style.iconButtonHoverEffect}
                          containerStyle={style.iconButton}
                          iconProps={{
                            name: 'download',
                            iconType: 'plain',
                            iconSize: 20,
                            tintColor: `${$config.SECONDARY_ACTION_COLOR}`,
                          }}
                          onPress={() => {
                            console.log('onpress');
                            downloadRecording(link);
                          }}
                        />
                      </View>
                      <View style={style.pl15}>
                        <IconButtonWithToolTip
                          // placement="bottom"
                          // toolTipMessage="Share"
                          hoverEffect={true}
                          hoverEffectStyle={style.iconButtonHoverEffect}
                          containerStyle={style.iconButton}
                          iconProps={{
                            name: 'link-share',
                            iconType: 'plain',
                            iconSize: 20,
                            tintColor: `${$config.SECONDARY_ACTION_COLOR}`,
                          }}
                          onPress={async () => {
                            if (await Linking.canOpenURL(link)) {
                              await Linking.openURL(link);
                            }
                          }}
                        />
                      </View>
                      <View style={[style.pl15, style.iconShareLink]}>
                        <Tooltip
                          isClickable
                          placement="left"
                          toolTipMessage="Link Copied"
                          onPress={() => {
                            Clipboard.setString(link);
                          }}
                          toolTipIcon={
                            <>
                              <ImageIcon
                                iconType="plain"
                                name="tick-fill"
                                tintColor={$config.SEMANTIC_SUCCESS}
                                iconSize={20}
                              />
                              <Spacer size={8} horizontal={true} />
                            </>
                          }
                          fontSize={12}
                          renderContent={() => {
                            return (
                              <TouchableOpacity
                                onPress={() => {
                                  Clipboard.setString(link);
                                }}>
                                <ImageIcon
                                  iconType="plain"
                                  name="link-share"
                                  iconSize={20}
                                  tintColor={$config.SECONDARY_ACTION_COLOR}
                                />
                              </TouchableOpacity>
                              // <IconButtonWithToolTip
                              //   placement="top"
                              //   toolTipMessage="Link Copied"
                              //   containerStyle={style.iconButton}
                              //   hoverEffect={true}
                              //   hoverEffectStyle={style.iconButtonHoverEffect}
                              //   iconProps={{
                              //     name: 'link-share',
                              //     iconType: 'plain',
                              //     iconSize: 20,
                              //     tintColor: `${$config.SECONDARY_ACTION_COLOR}`,
                              //     iconBackgroundColor: 'red',
                              //   }}
                              //   onPress={() => {
                              //     Clipboard.setString(link);
                              //     setToolTipVisible(true);
                              //   }}
                              // />

                              // <Text
                              //   style={[style.tlink, style.pl15]}
                              //   onPress={() => {
                              //     Clipboard.setString(link);
                              //     setToolTipVisible(true);
                              //   }}>
                              //   Copy shareable link
                              // </Text>
                            );
                          }}
                        />
                        {/* <IconButtonWithToolTip
                          placement="bottom"
                          toolTipMessage="Link Copied"
                          containerStyle={style.iconButton}
                          hoverEffect={true}
                          hoverEffectStyle={style.iconButtonHoverEffect}
                          iconProps={{
                            name: 'link-share',
                            iconType: 'plain',
                            iconSize: 20,
                            tintColor: `${$config.SECONDARY_ACTION_COLOR}`,
                            iconBackgroundColor: 'red',
                          }}
                          onPress={() => {
                            console.log('onpress');
                          }}
                        /> */}
                      </View>
                      {/* <View>
                        <Tooltip
                          isClickable
                          placement="right"
                          toolTipMessage="Link Copied"
                          onPress={() => {
                            Clipboard.setString(link);
                          }}
                          fontSize={12}
                          renderContent={(
                            isToolTipVisible,
                            setToolTipVisible,
                          ) => {
                            return (
                              <Text
                                style={[style.tlink, style.pl15]}
                                onPress={() => {
                                  Clipboard.setString(link);
                                  setToolTipVisible(true);
                                }}>
                                Copy shareable link
                              </Text>
                            );
                          }}
                        />
                      </View> */}
                    </View>
                  ))
                ) : (
                  <View style={style.tactions}>
                    <Text style={style.placeHolder}>
                      Recording is in progress
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </>
    );
  };

  return (
    <ScrollView contentContainerStyle={style.scrollgrow}>
      <ScrollView horizontal={true} contentContainerStyle={style.scrollgrow}>
        <View style={style.tbody}>{renderTableBodyContent()}</View>
      </ScrollView>
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

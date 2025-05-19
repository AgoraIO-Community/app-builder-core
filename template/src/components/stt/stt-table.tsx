import React from 'react';
import {Text, View, ScrollView, Linking, TouchableOpacity} from 'react-native';
import {style} from '../recordings/style';
import Pagination from '../../atoms/pagination/Pagination';
import Clipboard from '../../subComponents/Clipboard';
import {downloadS3Link, getFormattedDateTime} from '../../utils/common';
import Tooltip from '../../atoms/Tooltip';
import IconButtonWithToolTip from '../../atoms/IconButton';
import Loading from '../../subComponents/Loading';
import ImageIcon from '../../atoms/ImageIcon';
import Spacer from '../../atoms/Spacer';
import PlatformWrapper from '../../utils/PlatformWrapper';
import {FetchSTTResponse} from './STTDataTable';

function STableHeader() {
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
          <Text style={style.thText}>Status</Text>
        </View>
        <View style={style.th}>
          <Text style={style.thText}>Actions</Text>
        </View>
      </View>
    </View>
  );
}

function STableBody({
  status,
  stts,
}: {
  status: any;
  stts: FetchSTTResponse['stts'];
}) {
  const renderTableBodyContent = () => {
    if (status === 'idle' || status === 'pending') {
      return <Loading background="transparent" text="Fetching transcripts.." />;
    }
    if (status === 'resolved' && stts.length === 0) {
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
              No transcripts found for this meeting
            </Text>
          </View>
        </View>
      );
    }
    return (
      <>
        {stts.map(item => {
          const [date, time] = getFormattedDateTime(item.created_at);
          const sttStatus = item.status;
          if (
            sttStatus === 'STOPPING' ||
            sttStatus === 'STARTED' ||
            (sttStatus === 'INPROGRESS' && !item?.download_url)
          ) {
            return (
              <View key={item.id} style={style.pt12}>
                <View style={[style.infotextContainer, style.captionContainer]}>
                  <ImageIcon
                    iconSize={20}
                    iconType="plain"
                    name="info"
                    tintColor={$config.SEMANTIC_NEUTRAL}
                  />
                  <Text style={[style.captionText]}>
                    Current STT is ongoing. Once it concludes, we'll generate
                    the link
                  </Text>
                </View>
              </View>
            );
          }
          return (
            <View style={style.tbrow} key={item.id}>
              <View style={[style.td, style.plzero]}>
                <Text style={style.ttime}>{date}</Text>
              </View>
              <View style={[style.td]}>
                <Text style={style.ttime}>{time}</Text>
              </View>
              <View style={[style.td]}>
                <Text style={style.ttime}>{status}</Text>
              </View>
              <View style={style.td}>
                {!item.download_url ? (
                  <View style={(style.tactions, {marginTop: 0})}>
                    <Text style={style.placeHolder}>{'No stt found'}</Text>
                  </View>
                ) : item?.download_url?.length > 0 ? (
                  <View style={style.tactions}>
                    <View>
                      {item?.download_url?.map((link: string, i: number) => (
                        <View
                          style={[
                            style.tactions,
                            //if stts contains multiple parts then we need to add some space each row
                            i >= 1 ? {marginTop: 8} : {},
                          ]}>
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
                                downloadS3Link(link);
                              }}
                            />
                          </View>
                          <View style={style.pl10}>
                            <IconButtonWithToolTip
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
                          <View style={[style.pl10]}>
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
                                  <PlatformWrapper>
                                    {(isHovered: boolean) => (
                                      <TouchableOpacity
                                        style={[
                                          isHovered
                                            ? style.iconButtonHoverEffect
                                            : {},
                                          style.iconShareLink,
                                        ]}
                                        onPress={() => {
                                          Clipboard.setString(link);
                                        }}>
                                        <ImageIcon
                                          iconType="plain"
                                          name="copy-link"
                                          iconSize={20}
                                          tintColor={
                                            $config.SECONDARY_ACTION_COLOR
                                          }
                                        />
                                      </TouchableOpacity>
                                    )}
                                  </PlatformWrapper>
                                );
                              }}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={(style.tactions, {marginTop: 0})}>
                    <Text style={style.placeHolder}>No transcripts found</Text>
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

function STableFooter({currentPage, setCurrentPage, pagination}) {
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

export {STableHeader, STableBody, STableFooter};

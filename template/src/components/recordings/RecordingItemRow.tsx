import React, {useEffect, useState} from 'react';
import {View, Text, Linking, TouchableOpacity, StyleSheet} from 'react-native';
import {downloadRecording, getDuration, getRecordedDateTime} from './utils';
import IconButtonWithToolTip from '../../atoms/IconButton';
import Tooltip from '../../atoms/Tooltip';
import Clipboard from '../../subComponents/Clipboard';
import Spacer from '../../atoms/Spacer';
import PlatformWrapper from '../../utils/PlatformWrapper';
import {useFetchSTTTranscript} from '../text-tracks/useFetchSTTTranscript';
import {style} from '../common/data-table';
import {FetchRecordingData} from '../../subComponents/recording/useRecording';
import ImageIcon from '../../atoms/ImageIcon';
import TextTrackItemRow from './TextTrackItemRow';

interface RecordingItemRowProps {
  item: FetchRecordingData['recordings'][0];
  onDeleteAction: (id: string) => void;
  onTextTrackDownload: (textTrackLink: string) => void;
  showTextTracks: boolean;
}
export default function RecordingItemRow({
  item,
  onDeleteAction,
  onTextTrackDownload,
  showTextTracks = false,
}: RecordingItemRowProps) {
  const [expanded, setIsExpanded] = useState(false);

  const [date, time] = getRecordedDateTime(item.created_at);
  const recordingStatus = item.status;

  const {sttRecState, getSTTsForRecording} = useFetchSTTTranscript();
  const {
    status,
    error,
    data: {stts = []},
  } = sttRecState;

  useEffect(() => {
    if (expanded) {
      if (item.id) {
        getSTTsForRecording(item.id);
      }
    }
  }, [expanded, item.id, getSTTsForRecording]);

  if (
    recordingStatus === 'STOPPING' ||
    recordingStatus === 'STARTED' ||
    (recordingStatus === 'INPROGRESS' && !item?.download_url)
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
            Current recording is ongoing. Once it concludes, we'll generate the
            link
          </Text>
        </View>
      </View>
    );
  }

  // Collapsible Row
  return (
    <View>
      {/* ========== PARENT ROW ========== */}
      <View style={style.tbrow} key={item.id}>
        {showTextTracks && (
          <View style={style.tdIconCell}>
            <IconButtonWithToolTip
              hoverEffect={true}
              hoverEffectStyle={style.iconButtonHoverEffect}
              containerStyle={style.iconButton}
              iconProps={{
                name: expanded ? 'arrow-up' : 'arrow-down',
                iconType: 'plain',
                iconSize: 20,
                tintColor: `${$config.FONT_COLOR}`,
              }}
              onPress={() => setIsExpanded(prev => !prev)}
            />
          </View>
        )}
        <View style={[style.td, style.plzero]}>
          <Text style={style.ttime}>
            {date}
            <br />
            <Text style={style.ttime}>{time}</Text>
          </Text>
        </View>
        <View style={[style.td]}>
          <Text style={style.ttime}>
            {getDuration(item.created_at, item.ended_at)}
          </Text>
        </View>
        <View style={style.td}>
          {!item.download_url ? (
            <View style={(style.tactions, {marginTop: 0})}>
              <Text style={style.placeHolder}>{'No recording found'}</Text>
            </View>
          ) : item?.download_url?.length > 0 ? (
            <View style={style.tactions}>
              <View>
                {item?.download_url?.map((link: string, i: number) => (
                  <View
                    style={[
                      style.tactions,
                      //if recording contains multiple parts then we need to add some space each row
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
                          downloadRecording(link);
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
                                    tintColor={$config.SECONDARY_ACTION_COLOR}
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
              <View style={[style.pl10]}>
                <IconButtonWithToolTip
                  hoverEffect={true}
                  hoverEffectStyle={style.iconButtonHoverEffect}
                  containerStyle={style.iconButton}
                  iconProps={{
                    name: 'delete',
                    iconType: 'plain',
                    iconSize: 20,
                    tintColor: `${$config.SEMANTIC_ERROR}`,
                  }}
                  onPress={() => {
                    onDeleteAction && onDeleteAction(item.id);
                  }}
                />
              </View>
            </View>
          ) : (
            <View style={(style.tactions, {marginTop: 0})}>
              <Text style={style.placeHolder}>No recordings found</Text>
            </View>
          )}
        </View>
      </View>
      {/* ========== CHILDREN ROW ========== */}
      {expanded && (
        <View style={expanedStyles.expandedContainer}>
          <View>
            <Text style={expanedStyles.expandedHeaderText}>Text-tracks</Text>
          </View>
          <View style={expanedStyles.expandedHeaderBody}>
            {status === 'idle' || status === 'pending' ? (
              <Text style={style.ttime}>Fetching text-tracks....</Text>
            ) : status === 'rejected' ? (
              <Text style={style.ttime}>
                {error?.message ||
                  'There was an error while fetching the text-tracks'}
              </Text>
            ) : status === 'resolved' && stts?.length === 0 ? (
              <Text style={style.ttime}>
                There are no text-tracks's for this recording
              </Text>
            ) : (
              <>
                <Text style={style.ttime}>Found {stts.length} text tracks</Text>
                <View>
                  {stts.map(item => (
                    <TextTrackItemRow
                      key={item.id}
                      item={item}
                      onTextTrackDownload={onTextTrackDownload}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const expanedStyles = StyleSheet.create({
  expandedContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    color: $config.FONT_COLOR,
    borderColor: $config.CARD_LAYER_3_COLOR,
    backgroundColor: $config.CARD_LAYER_2_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderRadius: 5,
  },
  expandedHeaderText: {
    fontSize: 15,
    lineHeight: 32,
    fontWeight: '500',
    color: $config.FONT_COLOR,
  },
  expandedHeaderBody: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});

import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import IconButtonWithToolTip from '../../atoms/IconButton';
import Tooltip from '../../atoms/Tooltip';
import Clipboard from '../../subComponents/Clipboard';
import Spacer from '../../atoms/Spacer';
import PlatformWrapper from '../../utils/PlatformWrapper';
import {FetchSTTTranscriptResponse} from '../text-tracks/useFetchSTTTranscript';
import {style} from '../common/data-table';
import ImageIcon from '../../atoms/ImageIcon';

interface TextTrackItemRowProps {
  item: FetchSTTTranscriptResponse['stts'][0];
  onTextTrackDownload: (link: string) => void;
}

export default function TextTrackItemRow({
  item,
  onTextTrackDownload,
}: TextTrackItemRowProps) {
  const textTrackStatus = item.status;

  return (
    <View style={style.td} key={item.id}>
      {!item.download_url ? (
        <View style={[style.tactions, {marginTop: 0}]}>
          {textTrackStatus === 'STOPPING' ||
          textTrackStatus === 'STARTED' ||
          (textTrackStatus === 'INPROGRESS' && !item?.download_url) ? (
            <Text style={style.placeHolder}>
              {'The link will be generated once the meeting ends'}
            </Text>
          ) : (
            <Text style={style.placeHolder}>{'No text-tracks found'}</Text>
          )}
        </View>
      ) : item?.download_url?.length > 0 ? (
        <View style={style.tactions}>
          <View>
            {item?.download_url?.map((link: string, i: number) => (
              <View
                key={i}
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
                      onTextTrackDownload && onTextTrackDownload(link);
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
                                isHovered ? style.iconButtonHoverEffect : {},
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
        </View>
      ) : (
        <View style={(style.tactions, {marginTop: 0})}>
          <Text style={style.placeHolder}>No text-tracks found</Text>
        </View>
      )}
    </View>
  );
}

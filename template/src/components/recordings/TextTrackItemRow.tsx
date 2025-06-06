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
import {capitalizeFirstLetter} from '../../utils/common';

interface TextTrackItemRowProps {
  item: FetchSTTTranscriptResponse['stts'][0];
  // onDeleteAction: (id: string) => void;
  // onDownloadAction: (link: string) => void;
}

export default function TextTrackItemRow({
  item,
}: // onDeleteAction,
// onDownloadAction,
TextTrackItemRowProps) {
  const textTrackStatus = item.status;

  if (
    textTrackStatus === 'STOPPING' ||
    textTrackStatus === 'STARTED' ||
    (textTrackStatus === 'INPROGRESS' && !item?.download_url)
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
            Current STT is ongoing. Once the meeting concludes, we'll generate
            the link
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={style.tbrow} key={item.id}>
      <View style={[style.td]}>
        <Text style={style.ttime}>
          {capitalizeFirstLetter(textTrackStatus)}
        </Text>
      </View>
      <View style={style.td}>
        {!item.download_url ? (
          <View style={[style.tactions, {marginTop: 0}]}>
            <Text style={style.placeHolder}>{'No text-tracks found'}</Text>
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
                        // onDownloadAction && onDownloadAction(link);
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
                        //show confirmation popup
                        // onDeleteAction && onDeleteAction(item.id);
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
    </View>
  );
}

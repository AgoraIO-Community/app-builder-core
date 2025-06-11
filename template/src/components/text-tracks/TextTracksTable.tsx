import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Tooltip from '../../atoms/Tooltip';
import Clipboard from '../../subComponents/Clipboard';
import Spacer from '../../atoms/Spacer';
import {style} from '../recordings/style';
import {TableBody, TableFooter, TableHeader} from '../common/data-table';
import {
  FetchSTTTranscriptResponse,
  useFetchSTTTranscript,
} from './useFetchSTTTranscript';
import {
  capitalizeFirstLetter,
  downloadS3Link,
  getFormattedDateTime,
} from '../../utils/common';
import IconButtonWithToolTip from '../../atoms/IconButton';
import ImageIcon from '../../atoms/ImageIcon';
import Loading from '../../subComponents/Loading';
import GenericPopup from '../common/GenericPopup';
import PlatformWrapper from '../../utils/PlatformWrapper';

const headers = ['Date', 'Time', 'Status', 'Actions'];

interface TextTrackItemRowProps {
  item: FetchSTTTranscriptResponse['stts'][0];
  onDeleteAction: (id: string) => void;
  onDownloadAction: (link: string) => void;
}

function TextTrackItemRow({
  item,
  onDeleteAction,
  onDownloadAction,
}: TextTrackItemRowProps) {
  const [date, time] = getFormattedDateTime(item.created_at);
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
      <View style={[style.td, style.plzero]}>
        <Text style={style.ttime}>{date}</Text>
      </View>
      <View style={[style.td]}>
        <Text style={style.ttime}>{time}</Text>
      </View>
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
                        onDownloadAction(link);
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
                        onDeleteAction && onDeleteAction(item.id);
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

function EmptyTextTrackState() {
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
          No text-tracks found for this meeting
        </Text>
      </View>
    </View>
  );
}

function ErrorTextTrackState({message}: {message: string}) {
  return <Text style={[style.ttime, style.pv10, style.ph20]}>{message}</Text>;
}

function TextTracksTable() {
  const {getSTTs, sttState, currentPage, setCurrentPage, deleteTranscript} =
    useFetchSTTTranscript();

  const {
    status,
    data: {stts, pagination},
    error: fetchTranscriptError,
  } = sttState;

  useEffect(() => {
    getSTTs(currentPage);
  }, [currentPage, getSTTs]);

  // id of text-tracj to delete
  const [textTrackIdToDelete, setTextTrackIdToDelete] = React.useState<
    string | undefined
  >(undefined);

  // message for any download‐error popup
  const [errorSnack, setErrorSnack] = React.useState<string | undefined>();

  if (status === 'rejected') {
    return <ErrorTextTrackState message={fetchTranscriptError?.message} />;
  }

  const onDeleteTextTrackRecord = async (trackId: string) => {
    try {
      await deleteTranscript(trackId!);
    } catch (err: any) {
      setErrorSnack(err.message);
    } finally {
      setTextTrackIdToDelete(undefined);
    }
  };

  return (
    <>
      <View style={style.ttable}>
        <TableHeader columns={headers} />
        <TableBody
          status={status}
          items={stts}
          loadingComponent={
            <Loading background="transparent" text="Fetching text-tracks.." />
          }
          renderRow={item => (
            <TextTrackItemRow
              key={item.id}
              item={item}
              onDeleteAction={id => {
                setTextTrackIdToDelete(id);
              }}
              onDownloadAction={link => {
                downloadS3Link(link).catch((err: Error) => {
                  setErrorSnack(err.message || 'Download failed');
                });
              }}
            />
          )}
          emptyComponent={<EmptyTextTrackState />}
        />
        <TableFooter
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pagination={pagination}
        />
      </View>
      {textTrackIdToDelete && (
        <GenericPopup
          title="Delete ? "
          variant="error"
          message="Are you sure want to delete the text-track ? This action can't be undone."
          visible={!!textTrackIdToDelete}
          setVisible={() => setTextTrackIdToDelete(undefined)}
          onConfirm={() => {
            const idToDelete = textTrackIdToDelete;
            setTextTrackIdToDelete(undefined);
            onDeleteTextTrackRecord(idToDelete);
          }}
          onCancel={() => {
            setTextTrackIdToDelete(undefined);
          }}
        />
      )}
      {/** DOWNLOAD ERROR POPUP **/}
      {errorSnack && (
        <GenericPopup
          title="Error"
          variant="error"
          message={errorSnack}
          visible={true}
          setVisible={() => setErrorSnack(undefined)}
          onConfirm={() => setErrorSnack(undefined)}
        />
      )}
    </>
  );
}

export default TextTracksTable;

import {StyleSheet, View, Text} from 'react-native';
import React from 'react';
import {useRender, useRtc} from 'customization-api';
import {useCaption} from './useCaption';
import CaptionText from './CaptionText';
import Loading from '../Loading';
import {isWebInternal} from '../../utils/common';
import useStreamMessageUtils from './useStreamMessageUtils';
import {StreamMessageCallback} from 'react-native-agora/lib/typescript/common/RtcEvents';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';

const Caption: React.FC = () => {
  const {RtcEngine} = useRtc();
  const {
    isLangChangeInProgress,
    captionObj, //state for current live caption for all users
    isSTTListenerAdded,
    setIsSTTListenerAdded,
    activeSpeakerRef,
    prevSpeakerRef,
  } = useCaption();

  const {streamMessageCallback} = useStreamMessageUtils();
  const {renderList} = useRender();

  const [activeContainerFlex, setActiveContainerFlex] = React.useState(1);
  const [activelinesAvailable, setActiveLinesAvailable] = React.useState(1);
  const [inActiveLinesAvailable, setInActiveLinesAvaialble] = React.useState(0);

  const handleStreamMessageCallback = (
    ...args: [number, Uint8Array] | [number, string, Uint8Array]
  ) => {
    setIsSTTListenerAdded(true);
    if (isWebInternal()) {
      streamMessageCallback(args as [number, Uint8Array]);
    } else {
      const [uid, , data] = args;
      const streamBuffer = Object.values(data);
      streamMessageCallback([uid, new Uint8Array(streamBuffer)]);
    }
  };

  React.useEffect(() => {
    !isSTTListenerAdded &&
      RtcEngine.addListener(
        'StreamMessage',
        handleStreamMessageCallback as unknown as StreamMessageCallback,
      );
  }, []);

  if (isLangChangeInProgress)
    return (
      <Loading
        text="Setting Spoken Language"
        background="transparent"
        indicatorColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
        textColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
      />
    );

  console.log('current speaker uid', activeSpeakerRef.current);
  console.log('prev current uid ', prevSpeakerRef.current);

  if (Object.keys(captionObj).length === 0) return <></>;

  const speakerCount = prevSpeakerRef.current === '' ? 1 : 2;

  return (
    <View style={styles.captionContainer}>
      {
        <>
          {/* <Text style={{color: 'yellow', position: 'absolute', top: 20}}>
            Active Speaker : {renderList[activeSpeakerRef.current]?.name || ''}{' '}
            ({activeSpeakerRef.current})- Lines : {activelinesAvailable}
          </Text>
          <Text style={{color: 'white', position: 'absolute', top: 0}}>
            Prev Speaker: {renderList[prevSpeakerRef.current]?.name || ''} (
            {prevSpeakerRef.current})- Lines : {inActiveLinesAvailable}
          </Text> */}

          {captionObj[prevSpeakerRef.current] &&
          captionObj[prevSpeakerRef.current].text ? (
            <CaptionText
              user={renderList[prevSpeakerRef.current].name || 'Speaker'}
              value={captionObj[prevSpeakerRef.current].text}
              activeSpeakersCount={speakerCount}
              isActiveSpeaker={false}
              activeContainerFlex={1 - activeContainerFlex}
              setActiveContainerFlex={setActiveContainerFlex}
              activelinesAvailable={3 - activelinesAvailable}
              setActiveLinesAvailable={setActiveLinesAvailable}
              inActiveLinesAvailable={inActiveLinesAvailable}
              setInActiveLinesAvaialble={setInActiveLinesAvaialble}
            />
          ) : (
            <></>
          )}
          {captionObj[activeSpeakerRef.current] &&
          captionObj[activeSpeakerRef.current].text ? (
            <CaptionText
              user={renderList[activeSpeakerRef.current].name || 'Speaker'}
              value={captionObj[activeSpeakerRef.current].text}
              activeSpeakersCount={speakerCount}
              isActiveSpeaker={true}
              activeContainerFlex={activeContainerFlex}
              setActiveContainerFlex={setActiveContainerFlex}
              activelinesAvailable={activelinesAvailable}
              setActiveLinesAvailable={setActiveLinesAvailable}
              inActiveLinesAvailable={inActiveLinesAvailable}
              setInActiveLinesAvaialble={setInActiveLinesAvaialble}
            />
          ) : (
            <></>
          )}
        </>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  captionContainer: {
    width: '100%',
    height: '100%',
  },
});

export default React.memo(Caption);

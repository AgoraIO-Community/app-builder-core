import {StyleSheet, TextStyle, View} from 'react-native';
import React from 'react';
import {useContent} from 'customization-api';
import {useCaption} from './useCaption';
import CaptionText from './CaptionText';
import Loading from '../Loading';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import {useString} from '../../utils/useString';
import {useLocalUid} from '../../../agora-rn-uikit';
import {
  sttSettingSpokenLanguageText,
  sttSettingTranslationLanguageText,
} from '../../language/default-labels/videoCallScreenLabels';

interface CaptionProps {
  captionTextStyle?: TextStyle;
  captionUserStyle?: TextStyle;
}

const Caption: React.FC<CaptionProps> = ({
  captionTextStyle = {},
  captionUserStyle = {},
}) => {
  const {
    isLangChangeInProgress,
    captionObj, //state for current live caption for all users
    activeSpeakerRef,
    prevSpeakerRef,
    getBotOwnerUid,
    isSTTActive,
    remoteSpokenLanguages,
  } = useCaption();
  const currentUserUid = useLocalUid();
  const ssLabel = useString(sttSettingSpokenLanguageText)();
  const stLabel = useString<boolean>(sttSettingTranslationLanguageText)(
    isSTTActive,
  );
  const {defaultContent} = useContent();

  const [activelinesAvailable, setActiveLinesAvailable] = React.useState(0);
  const [inActiveLinesAvailable, setInActiveLinesAvaialble] = React.useState(0);

  if (isLangChangeInProgress) {
    return (
      <Loading
        text={stLabel}
        background="transparent"
        indicatorColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
        textColor={$config.FONT_COLOR + hexadecimalTransparency['70%']}
      />
    );
  }

  console.log('[STT_GLOBAL]  speaker uid', activeSpeakerRef.current);
  console.log('[STT_GLOBAL] prev current uid ', prevSpeakerRef.current);
  console.log('[STT_GLOBAL] captionObj ', captionObj);

  const speakerCount = prevSpeakerRef.current === '' ? 1 : 2;

  return (
    <View style={styles.captionContainer}>
      {
        <>
          {/* <Text
            style={{
              color: 'yellow',
              position: 'absolute',
              top: -25,
              left: 180,
            }}>
            Active: {defaultContent[activeSpeakerRef.current]?.name || ''} Line :{' '}
            {activelinesAvailable}
          </Text>
          <Text
            style={{color: 'white', position: 'absolute', top: -25, left: 0}}>
            Prev: {defaultContent[prevSpeakerRef.current]?.name || ' '} Line :
            {Math.min(inActiveLinesAvailable, 3 - activelinesAvailable)}
          </Text> */}

          {captionObj[prevSpeakerRef.current] &&
          captionObj[prevSpeakerRef.current].text ? (
            <CaptionText
              user={
                defaultContent[getBotOwnerUid(prevSpeakerRef.current)]?.name ||
                'Speaker'
              }
              value={captionObj[prevSpeakerRef.current].text}
              translations={captionObj[prevSpeakerRef.current].translations}
              activeSpeakersCount={speakerCount}
              isActiveSpeaker={false}
              activelinesAvailable={activelinesAvailable}
              setActiveLinesAvailable={setActiveLinesAvailable}
              inActiveLinesAvailable={inActiveLinesAvailable}
              setInActiveLinesAvaialble={setInActiveLinesAvaialble}
              captionUserStyle={captionUserStyle}
              captionTextStyle={captionTextStyle}
              speakerUid={getBotOwnerUid(prevSpeakerRef.current)}
              userLocalUid={currentUserUid}
            />
          ) : (
            <></>
          )}
          {captionObj[activeSpeakerRef.current] &&
          captionObj[activeSpeakerRef.current].text ? (
            <CaptionText
              user={
                defaultContent[getBotOwnerUid(activeSpeakerRef.current)]
                  ?.name || 'Speaker'
              }
              value={captionObj[activeSpeakerRef.current].text}
              translations={captionObj[activeSpeakerRef.current].translations}
              activeSpeakersCount={speakerCount}
              isActiveSpeaker={true}
              activelinesAvailable={activelinesAvailable}
              setActiveLinesAvailable={setActiveLinesAvailable}
              inActiveLinesAvailable={inActiveLinesAvailable}
              setInActiveLinesAvaialble={setInActiveLinesAvaialble}
              captionUserStyle={captionUserStyle}
              captionTextStyle={captionTextStyle}
              speakerUid={getBotOwnerUid(activeSpeakerRef.current)}
              userLocalUid={currentUserUid}
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

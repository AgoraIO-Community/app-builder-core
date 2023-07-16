import {StyleSheet, View, Platform} from 'react-native';
import React, {MutableRefObject} from 'react';
import {isWeb, useRender, useRtc} from 'customization-api';
import protoRoot from './proto/ptoto';
import {useCaption} from './useCaption';
import {CaptionText} from './CaptionText';
import Spacer from '../../../src/atoms/Spacer';
import Loading from '../Loading';
// import {streamMessageCallback} from './utils';
import {isWebInternal} from '../../utils/common';
import useStreamMessageUtils from './useStreamMessageUtils';
import {StreamMessageCallback} from 'react-native-agora/lib/typescript/common/RtcEvents';

const Caption: React.FC = () => {
  const {RtcEngine} = useRtc();
  const {
    isLangChangeInProgress,
    captionObj, //state for current live caption for all users
    setCaptionObj,
    isSTTListenerAdded,
    setIsSTTListenerAdded,
  } = useCaption();

  const {streamMessageCallback} = useStreamMessageUtils();
  const {renderList} = useRender();

  const handleStreamMessageCallback1 = (
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
    if (!isSTTListenerAdded) {
      RtcEngine.addListener(
        'StreamMessage',
        handleStreamMessageCallback1 as unknown as StreamMessageCallback,
      );
    }
    setCaptionObj({}); // clear live captions on mount
  }, []);

  const speakers = Object.entries(captionObj);
  const activeSpeakers = speakers.filter((item) => item[1] !== '');
  if (isLangChangeInProgress)
    return <Loading text="Setting Spoken Language" background="transparent" />;

  return (
    <View style={styles.captionContainer}>
      {speakers.map(([key, value], index) => {
        return (
          <React.Fragment key={key}>
            {value ? (
              <CaptionText
                user={renderList[Number(key)]?.name || 'Speaker'}
                value={value.trim()}
                activeSpeakersCount={activeSpeakers?.length || 0}
              />
            ) : null}
            {index !== speakers.length - 1 && <Spacer size={10} />}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  captionContainer: {
    width: '100%',
  },
});

export default Caption;

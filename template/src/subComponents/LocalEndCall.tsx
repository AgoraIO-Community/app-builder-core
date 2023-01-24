import React, {useContext, useState} from 'react';
import {useRtc} from 'customization-api';
import EndcallPopup from './EndcallPopup';
import StorageContext from '../components/StorageContext';
import {Prompt, useParams} from '../components/Router';
import IconButton, {IconButtonProps} from '../atoms/IconButton';
export interface LocalEndcallProps {
  showLabel?: boolean;
  isOnActionSheet?: boolean;
  render?: (onPress: () => void) => JSX.Element;
}

const LocalEndcall = (props: LocalEndcallProps) => {
  const {dispatch} = useRtc();
  const {showLabel = $config.ICON_TEXT, isOnActionSheet = false} = props;
  //commented for v1 release
  //const endCallLabel = useString('endCallButton')();
  const endCallLabel = 'Leave';
  const {setStore} = useContext(StorageContext);
  const [endcallVisible, setEndcallVisible] = useState(false);
  const {phrase} = useParams<{phrase: string}>();
  const onPress = () => {
    setEndcallVisible(true);
  };

  const endCall = async () => {
    setTimeout(() => {
      dispatch({
        type: 'EndCall',
        value: [],
      });
    });
  };

  let iconButtonProps: IconButtonProps = {
    iconProps: {
      name: 'end-call',
      tintColor: $config.PRIMARY_ACTION_TEXT_COLOR,
      iconBackgroundColor: $config.SEMANTIC_ERROR,
      iconContainerStyle: !isOnActionSheet && {
        width: 72,
        height: 52,
      },
    },
    onPress,
    btnTextProps: {
      text: showLabel ? endCallLabel : '',
      textColor: $config.FONT_COLOR,
    },
  };

  return props?.render ? (
    props.render(onPress)
  ) : (
    <>
      <Prompt
        when={true}
        message={(location, action) => {
          if (action === 'POP') {
            onPress();
            return false;
          }
          return true;
        }}
      />
      <EndcallPopup
        endCall={endCall}
        setModalVisible={setEndcallVisible}
        modalVisible={endcallVisible}
      />
      <IconButton {...iconButtonProps} />
    </>
  );
};
export default LocalEndcall;

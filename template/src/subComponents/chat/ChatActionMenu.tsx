import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import React from 'react';
import {calculatePosition, isMobileUA} from '../../utils/common';
import IconButton from '../../atoms/IconButton';
import hexadecimalTransparency from '../../utils/hexadecimalTransparency';
import ActionMenu, {ActionMenuItem} from '../../../src/atoms/ActionMenu';
import {useRoomInfo} from '../../components/room-info/useRoomInfo';
import {useChatConfigure} from '../../components/chat/chatConfigure';
import Clipboard from '../../subComponents/Clipboard';
import {useString} from '../../utils/useString';
import {
  chatActionMenuCopyLinkText,
  chatActionMenuDownloadText,
  chatActionMenuDeleteText,
} from '../../language/default-labels/videoCallScreenLabels';

interface MoreMenuProps {
  setActionMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
interface CaptionsActionMenuProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: (actionMenuVisible: boolean) => void;
  btnRef: React.RefObject<View>;
  fileName: string;
  fileUrl: string;
}

export const ChatActionMenu = (props: CaptionsActionMenuProps) => {
  const {actionMenuVisible, setActionMenuVisible, btnRef, fileName, fileUrl} =
    props;

  const actionMenuitems: ActionMenuItem[] = [];
  const [modalPosition, setModalPosition] = React.useState({});
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const {downloadAttachment} = useChatConfigure();

  const {
    data: {isHost},
  } = useRoomInfo();

  // only Host is authorized to start/stop stt
  actionMenuitems.push({
    icon: 'download',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: useString(chatActionMenuDownloadText)(),
    callback: () => {
      downloadAttachment(fileName, fileUrl);
      setActionMenuVisible(false);
    },
  });

  actionMenuitems.push({
    icon: 'clipboard',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: useString(chatActionMenuCopyLinkText)(),
    callback: () => {
      Clipboard.setString(fileUrl);
      setActionMenuVisible(false);
    },
  });
  actionMenuitems.push({
    icon: 'remove',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: useString(chatActionMenuDeleteText)(),
    callback: () => {
      setActionMenuVisible(false);
    },
  });

  React.useEffect(() => {
    if (actionMenuVisible) {
      //getting btnRef x,y
      btnRef?.current?.measure(
        (
          _fx: number,
          _fy: number,
          localWidth: number,
          localHeight: number,
          px: number,
          py: number,
        ) => {
          const data = calculatePosition({
            px,
            py,
            localWidth,
            localHeight,
            globalHeight,
            globalWidth,
          });
          setModalPosition(data);
          setIsPosCalculated(true);
        },
      );
    }
  }, [actionMenuVisible]);
  return (
    <>
      <ActionMenu
        from={'chat'}
        actionMenuVisible={actionMenuVisible && isPosCalculated}
        setActionMenuVisible={setActionMenuVisible}
        modalPosition={modalPosition}
        items={actionMenuitems}
      />
    </>
  );
};

export const MoreMenu = React.forwardRef<View, MoreMenuProps>((props, ref) => {
  const {setActionMenuVisible} = props;
  const isMobile = isMobileUA();
  return (
    <View ref={ref} collapsable={false}>
      <IconButton
        hoverEffect={true}
        hoverEffectStyle={{
          backgroundColor:
            $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['25%'],
          borderRadius: 18,
        }}
        iconProps={{
          iconType: 'plain',
          name: 'more-menu',
          iconSize: 18,
          tintColor: $config.SECONDARY_ACTION_COLOR,
          iconContainerStyle: {
            padding: 4,
            borderRadius: 18,
            backgroundColor: isMobile
              ? $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['25%']
              : 'transparent',
          },
        }}
        onPress={() => {
          setActionMenuVisible(true);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({});

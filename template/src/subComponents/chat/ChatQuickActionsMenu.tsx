import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import React from 'react';
import ActionMenu, {ActionMenuItem} from '../../../src/atoms/ActionMenu';
import {calculatePosition} from '../../../src/utils/common';
import IconButton from '../../../src/atoms/IconButton';
import hexadecimalTransparency from '../../../src/utils/hexadecimalTransparency';

interface ChatQuickActionsMenuProps {
  actionMenuVisible: boolean;
  setActionMenuVisible: (actionMenuVisible: boolean) => void;
  btnRef: React.RefObject<View>;
}

const ChatQuickActionsMenu = (props: ChatQuickActionsMenuProps) => {
  const {actionMenuVisible, setActionMenuVisible, btnRef} = props;
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const [modalPosition, setModalPosition] = React.useState({});
  const actionMenuitems: ActionMenuItem[] = [];

  actionMenuitems.push({
    icon: 'reply',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: 'Reply',
    onPress: () => {
      setActionMenuVisible(false);
    },
  });
  actionMenuitems.push({
    icon: 'reply_all',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    iconSize: 12,
    title: 'Private Reply',
    onPress: () => {
      setActionMenuVisible(false);
    },
  });
  actionMenuitems.push({
    icon: 'clipboard',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: 'Copy Message',
    onPress: () => {
      setActionMenuVisible(false);
    },
  });
  actionMenuitems.push({
    icon: 'pin-outlined',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: 'Pin Message',
    onPress: () => {
      setActionMenuVisible(false);
    },
  });
  actionMenuitems.push({
    icon: 'block_user',
    iconColor: $config.SEMANTIC_ERROR,
    textColor: $config.SEMANTIC_ERROR,
    title: 'Block User',
    onPress: () => {
      setActionMenuVisible(false);
    },
  });

  actionMenuitems.push({
    icon: 'delete',
    iconColor: $config.SEMANTIC_ERROR,
    textColor: $config.SEMANTIC_ERROR,
    title: 'Delete Message',
    onPress: () => {
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

export const MoreMessageOptions = () => {
  const moreIconRef = React.useRef(null);
  const [messageOptionsMenuVisible, setMessageOptionsMenuVisible] =
    React.useState(false);
  return (
    <>
      <ChatQuickActionsMenu
        actionMenuVisible={messageOptionsMenuVisible}
        setActionMenuVisible={setMessageOptionsMenuVisible}
        btnRef={moreIconRef}
      />
      <View
        ref={moreIconRef}
        collapsable={false}
        style={{
          width: 20,
          height: 20,
          padding: 2,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 20,
        }}>
        <IconButton
          hoverEffect={true}
          hoverEffectStyle={{
            backgroundColor:
              $config.CARD_LAYER_5_COLOR + hexadecimalTransparency['20%'],
            borderRadius: 4,
            padding: 2,
          }}
          iconProps={{
            iconType: 'plain',
            name: 'more-menu',
            iconSize: 20,
            tintColor: $config.SECONDARY_ACTION_COLOR,
          }}
          onPress={() => {
            setMessageOptionsMenuVisible(true);
          }}
        />
      </View>
    </>
  );
};

export default ChatQuickActionsMenu;

const styles = StyleSheet.create({});

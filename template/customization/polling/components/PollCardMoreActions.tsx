import React, {Dispatch, SetStateAction} from 'react';
import {View, useWindowDimensions} from 'react-native';
import {
  ActionMenu,
  ActionMenuItem,
  calculatePosition,
  ThemeConfig,
  $config,
} from 'customization-api';
import {PollStatus, PollTaskRequestTypes} from '../context/poll-context';

interface PollCardMoreActionsMenuProps {
  status: PollStatus;
  moreBtnRef: React.RefObject<View>;
  actionMenuVisible: boolean;
  setActionMenuVisible: Dispatch<SetStateAction<boolean>>;
  onCardActionSelect: (action: PollTaskRequestTypes) => void;
}
const PollCardMoreActions = (props: PollCardMoreActionsMenuProps) => {
  const {
    actionMenuVisible,
    setActionMenuVisible,
    moreBtnRef,
    onCardActionSelect,
    status,
  } = props;
  const actionMenuItems: ActionMenuItem[] = [];
  const [modalPosition, setModalPosition] = React.useState({});
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();

  status !== PollStatus.FINISHED &&
    actionMenuItems.push({
      icon: 'send',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: 'Launch Poll',
      titleStyle: {
        fontSize: ThemeConfig.FontSize.small,
      },
      disabled: status !== PollStatus.LATER,
      onPress: () => {
        onCardActionSelect(PollTaskRequestTypes.SEND);
        setActionMenuVisible(false);
      },
    });

  status === PollStatus.ACTIVE &&
    actionMenuItems.push({
      icon: 'share',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: 'Publish Result',
      titleStyle: {
        fontSize: ThemeConfig.FontSize.small,
      },
      onPress: () => {
        onCardActionSelect(PollTaskRequestTypes.PUBLISH);
        setActionMenuVisible(false);
      },
    });

  status !== PollStatus.LATER &&
    actionMenuItems.push({
      icon: 'download',
      iconColor: $config.SECONDARY_ACTION_COLOR,
      textColor: $config.FONT_COLOR,
      title: 'Export Resuts',
      titleStyle: {
        fontSize: ThemeConfig.FontSize.small,
      },
      onPress: () => {
        onCardActionSelect(PollTaskRequestTypes.EXPORT);
        setActionMenuVisible(false);
      },
    });

  // actionMenuItems.push({
  //   icon: 'close',
  //   iconColor: $config.SECONDARY_ACTION_COLOR,
  //   textColor: $config.FONT_COLOR,
  //   title: 'Finish Poll',
  //   titleStyle: {
  //     fontSize: ThemeConfig.FontSize.small,
  //   },
  //   disabled: status === PollStatus.LATER || status === PollStatus.FINISHED,
  //   onPress: () => {
  //     onCardActionSelect(PollTaskRequestTypes.FINISH);
  //     setActionMenuVisible(false);
  //   },
  // });

  actionMenuItems.push({
    icon: 'delete',
    iconColor: $config.SEMANTIC_ERROR,
    textColor: $config.SEMANTIC_ERROR,
    title: 'Delete Poll',
    titleStyle: {
      fontSize: ThemeConfig.FontSize.small,
    },
    onPress: () => {
      onCardActionSelect(PollTaskRequestTypes.DELETE);
      setActionMenuVisible(false);
    },
  });

  React.useEffect(() => {
    if (actionMenuVisible && moreBtnRef.current) {
      //getting btnRef x,y
      moreBtnRef?.current?.measure(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionMenuVisible]);

  return (
    <>
      <ActionMenu
        from={'poll-card'}
        actionMenuVisible={actionMenuVisible && isPosCalculated}
        setActionMenuVisible={setActionMenuVisible}
        modalPosition={modalPosition}
        items={actionMenuItems}
      />
    </>
  );
};

export {PollCardMoreActions};

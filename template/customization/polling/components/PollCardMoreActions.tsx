import React, {Dispatch, SetStateAction} from 'react';
import {View, useWindowDimensions} from 'react-native';
import {
  ActionMenu,
  ActionMenuItem,
  calculatePosition,
  ThemeConfig,
} from 'customization-api';

export enum PollTaskRequestTypes {
  PUBLISH = 'PUBLISH',
  EXPORT = 'EXPORT',
  CLOSE = 'CLOSE',
  VIEW_DETAILS = 'VIEW_DETAILS',
  DELETE = 'DELETE',
  SHARE = 'SHARE',
}

interface PollCardMoreActionsMenuProps {
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
  } = props;
  const actionMenuitems: ActionMenuItem[] = [];
  const [modalPosition, setModalPosition] = React.useState({});
  const [isPosCalculated, setIsPosCalculated] = React.useState(false);
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();

  actionMenuitems.push({
    icon: 'share',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: 'Publish Result',
    titleStyle: {
      fontSize: ThemeConfig.FontSize.small,
    },
    disabled: false,
    onPress: () => {
      onCardActionSelect(PollTaskRequestTypes.PUBLISH);
      setActionMenuVisible(false);
    },
  });

  actionMenuitems.push({
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

  actionMenuitems.push({
    icon: 'close',
    iconColor: $config.SECONDARY_ACTION_COLOR,
    textColor: $config.FONT_COLOR,
    title: 'Close Poll',
    titleStyle: {
      fontSize: ThemeConfig.FontSize.small,
    },
    onPress: () => {
      onCardActionSelect(PollTaskRequestTypes.CLOSE);
      setActionMenuVisible(false);
    },
  });

  actionMenuitems.push({
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
    if (actionMenuVisible) {
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
  }, [actionMenuVisible]);

  return (
    <>
      <ActionMenu
        from={'poll-card'}
        actionMenuVisible={actionMenuVisible && isPosCalculated}
        setActionMenuVisible={setActionMenuVisible}
        modalPosition={modalPosition}
        items={actionMenuitems}
      />
    </>
  );
};

export {PollCardMoreActions};

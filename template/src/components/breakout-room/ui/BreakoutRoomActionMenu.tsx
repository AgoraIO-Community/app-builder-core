/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the "Materials") are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.'s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/

import React, {useState, useRef, useEffect} from 'react';
import {View, useWindowDimensions} from 'react-native';
import ActionMenu, {ActionMenuItem} from '../../../atoms/ActionMenu';
import IconButton from '../../../atoms/IconButton';
import {calculatePosition} from '../../../utils/common';
import {useRoomInfo} from 'customization-api';

interface RoomActionMenuProps {
  onDeleteRoom: () => void;
  onRenameRoom: () => void;
}

const BreakoutRoomActionMenu: React.FC<RoomActionMenuProps> = ({
  onDeleteRoom,
  onRenameRoom,
}) => {
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [isPosCalculated, setIsPosCalculated] = useState(false);
  const [modalPosition, setModalPosition] = useState({});
  const {width: globalWidth, height: globalHeight} = useWindowDimensions();
  const moreIconRef = useRef(null);

  const {
    data: {isHost},
  } = useRoomInfo();

  // Build action menu items based on context
  const actionMenuItems: ActionMenuItem[] = [];

  //  ACTION - Only show for hosts
  if (isHost) {
    actionMenuItems.push({
      order: 1,
      icon: 'pencil-filled',
      iconColor: $config.SEMANTIC_ERROR,
      textColor: $config.SEMANTIC_ERROR,
      title: 'Rename Room',
      onPress: () => {
        onRenameRoom();
        setActionMenuVisible(false);
      },
    });
    actionMenuItems.push({
      order: 2,
      icon: 'delete',
      iconColor: $config.SEMANTIC_ERROR,
      textColor: $config.SEMANTIC_ERROR,
      title: 'Delete Room',
      onPress: () => {
        onDeleteRoom();
        setActionMenuVisible(false);
      },
    });
  }

  // Calculate position when menu becomes visible
  useEffect(() => {
    if (actionMenuVisible) {
      moreIconRef?.current?.measure(
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

  // Don't render if no actions available
  if (actionMenuItems.length === 0) {
    return null;
  }

  return (
    <>
      <ActionMenu
        from={'breakout-room-header'}
        actionMenuVisible={actionMenuVisible && isPosCalculated}
        setActionMenuVisible={setActionMenuVisible}
        modalPosition={modalPosition}
        items={actionMenuItems}
      />
      <View
        ref={moreIconRef}
        collapsable={false}
        style={{
          width: 24,
          height: 24,
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <IconButton
          hoverEffect={false}
          iconProps={{
            iconType: 'plain',
            name: 'more-menu',
            iconSize: 20,
            tintColor: $config.SECONDARY_ACTION_COLOR,
          }}
          onPress={() => {
            setActionMenuVisible(true);
          }}
        />
      </View>
    </>
  );
};

export default BreakoutRoomActionMenu;

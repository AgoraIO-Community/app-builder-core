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

import React from 'react';
import {useRaiseHand} from './RaiseHandProvider';
import IconButton from '../../atoms/IconButton';
import {IconButtonProps} from '../../atoms/IconButton';
import {isMobileUA} from '../../utils/common';
import {useToolbarMenu} from '../../utils/useMenu';
import ToolbarMenuItem from '../../atoms/ToolbarMenuItem';
import {useActionSheet} from '../../utils/useActionSheet';
import {useToolbarProps} from '../../atoms/ToolbarItem';
import {StyleSheet} from 'react-native';
import ThemeConfig from '../../theme';
import TertiaryButton from '../../atoms/TertiaryButton';

const RaiseHandButton: React.FC = () => {
  const {isHandRaised, toggleHand} = useRaiseHand();

  return (
    <TertiaryButton
      containerStyle={style.raiseHandBtn}
      textStyle={style.raiseHandBtnText}
      text={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
      iconName={isHandRaised ? 'lower-hand' : 'raise-hand'}
      iconColor={$config.SEMANTIC_WARNING}
      iconSize={15}
      onPress={toggleHand}
    />
  );
};

export default RaiseHandButton;

const style = StyleSheet.create({
  raiseHandBtn: {
    width: '100%',
    borderRadius: 4,
    borderColor: $config.SECONDARY_ACTION_COLOR,
    backgroundColor: 'transparent',
  },
  raiseHandBtnText: {
    textAlign: 'center',
    color: $config.SECONDARY_ACTION_COLOR,
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 16,
  },
});

/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
import React from 'react';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import Toolbar from '../atoms/Toolbar';
import {CustomToolbarMerge, CustomToolbarSorting} from '../utils/common';
import {ToolbarItemHide, ToolbarRightPresetProps} from '../atoms/ToolbarPreset';
import {filterObject} from '../utils';

const defaultItems: ToolbarRightPresetProps['items'] = {};

export interface RightbarProps {
  items?: ToolbarRightPresetProps['items'];
  includeDefaultItems?: boolean;
}
const Rightbar = (props: RightbarProps) => {
  const {includeDefaultItems = true, items = {}} = props;
  const {width, height} = useWindowDimensions();

  const isHidden = (hide: ToolbarItemHide = false) => {
    try {
      return typeof hide === 'boolean'
        ? hide
        : typeof hide === 'function'
        ? hide(width, height)
        : false;
    } catch (error) {
      console.log('debugging isHidden error', error);
      return false;
    }
  };

  const mergedItems = CustomToolbarMerge(
    includeDefaultItems ? defaultItems : {},
    items,
  );

  const startItems = filterObject(
    mergedItems,
    ([_, v]) => v?.align === 'start' && !isHidden(v?.hide),
  );
  const centerItems = filterObject(
    mergedItems,
    ([_, v]) => v?.align === 'center' && !isHidden(v?.hide),
  );
  const endItems = filterObject(
    mergedItems,
    ([_, v]) => v?.align === 'end' && !isHidden(v?.hide),
  );

  const startItemsOrdered = CustomToolbarSorting(startItems);
  const centerItemsOrdered = CustomToolbarSorting(centerItems);
  const endItemsOrdered = CustomToolbarSorting(endItems);

  const renderContent = (
    orderedKeys: string[],
    type: 'start' | 'center' | 'end',
  ) => {
    const renderContentItem = [];
    let index = 0;
    orderedKeys.forEach(keyName => {
      index = index + 1;
      let ToolbarComponent = null;
      if (type === 'start') {
        ToolbarComponent = startItems[keyName]?.component;
      } else if (type === 'center') {
        ToolbarComponent = centerItems[keyName]?.component;
      } else {
        ToolbarComponent = endItems[keyName]?.component;
      }
      if (ToolbarComponent) {
        renderContentItem.push(
          <ToolbarComponent key={`top-toolbar-${type}` + index} />,
        );
      }
    });

    return renderContentItem;
  };

  return (
    <Toolbar>
      <View style={style.startContent}>
        {renderContent(startItemsOrdered, 'start')}
      </View>
      <View style={style.centerContent}>
        {renderContent(centerItemsOrdered, 'center')}
      </View>
      <View style={style.endContent}>
        {renderContent(endItemsOrdered, 'end')}
      </View>
    </Toolbar>
  );
};

const style = StyleSheet.create({
  startContent: {
    flex: 1,
    zIndex: 2,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    zIndex: 2,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endContent: {
    flex: 1,
    zIndex: 2,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default Rightbar;

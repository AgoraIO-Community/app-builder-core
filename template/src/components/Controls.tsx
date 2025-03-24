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
import {
  BREAKPOINTS,
  CustomToolbarMerge,
  CustomToolbarSorting,
} from '../utils/common';
import {RoomInfoContextInterface, useRoomInfo} from './room-info/useRoomInfo';
import {useContent, useSpeechToText} from 'customization-api';
import {useCaption} from '../../src/subComponents/caption/useCaption';
import Toast from '../../react-native-toast-message';
import {getLanguageLabel} from '../../src/subComponents/caption/utils';
import Toolbar from '../atoms/Toolbar';
import {
  ToolbarPresetProps,
  ToolbarItemHide,
  ToolbarItemLabel,
} from '../atoms/ToolbarPreset';
import {useSetRoomInfo} from './room-info/useSetRoomInfo';
import {useString} from '../utils/useString';
import {
  sttSpokenLanguageToastHeading,
  sttSpokenLanguageToastSubHeading,
} from '../language/default-labels/videoCallScreenLabels';
import {filterObject} from '../utils/index';
import {useLanguage} from '../language/useLanguage';
import {
  LayoutToolbarItem,
  InviteToolbarItem,
  RaiseHandToolbarItem,
  LocalAudioToolbarItem,
  LocalVideoToolbarItem,
  SwitchCameraToolbarItem,
  ScreenShareToolbarItem,
  RecordingToolbarItem,
  MoreButtonToolbarItem,
  LocalEndcallToolbarItem,
} from './controls/toolbar-items';

const defaultItems: ToolbarPresetProps['items'] = {
  layout: {
    align: 'start',
    component: LayoutToolbarItem,
    order: 0,
    hide: w => {
      return w < BREAKPOINTS.lg ? true : false;
    },
  },
  invite: {
    align: 'start',
    component: InviteToolbarItem,
    order: 1,
    hide: w => {
      return w < BREAKPOINTS.lg ? true : false;
    },
  },
  'raise-hand': {
    align: 'center',
    component: RaiseHandToolbarItem,
    order: 0,
  },
  'local-audio': {
    align: 'center',
    component: LocalAudioToolbarItem,
    order: 1,
  },
  'local-video': {
    align: 'center',
    component: LocalVideoToolbarItem,
    order: 2,
  },
  'switch-camera': {
    align: 'center',
    component: SwitchCameraToolbarItem,
    order: 3,
  },
  screenshare: {
    align: 'center',
    component: ScreenShareToolbarItem,
    order: 4,
    hide: w => {
      return w < BREAKPOINTS.sm ? true : false;
    },
  },
  recording: {
    align: 'center',
    component: RecordingToolbarItem,
    order: 5,
    hide: w => {
      return w < BREAKPOINTS.sm ? true : false;
    },
  },
  more: {
    align: 'center',
    component: MoreButtonToolbarItem,
    order: 6,
  },
  'end-call': {
    align: 'center',
    component: LocalEndcallToolbarItem,
    order: 7,
  },
};

export interface ControlsProps {
  items?: ToolbarPresetProps['items'];
  includeDefaultItems?: boolean;
}

const Controls = (props: ControlsProps) => {
  const {languageCode} = useLanguage();
  const {items = {}, includeDefaultItems = true} = props;
  const {width, height} = useWindowDimensions();
  const {defaultContent} = useContent();
  const {setLanguage, setMeetingTranscript, setIsSTTActive} = useCaption();
  const defaultContentRef = React.useRef(defaultContent);
  const {setRoomInfo} = useSetRoomInfo();
  const heading = useString<'Set' | 'Changed'>(sttSpokenLanguageToastHeading);
  const subheading = useString<{
    action: 'Set' | 'Changed';
    newLanguage: string;
    oldLanguage: string;
    username: string;
  }>(sttSpokenLanguageToastSubHeading);

  const {sttLanguage, isSTTActive} = useRoomInfo();
  const {addStreamMessageListener} = useSpeechToText();

  React.useEffect(() => {
    defaultContentRef.current = defaultContent;
  }, [defaultContent]);

  React.useEffect(() => {
    // for mobile events are set in ActionSheetContent
    if (!sttLanguage) return;
    const {
      username,
      prevLang,
      newLang,
      uid,
      langChanged,
    }: RoomInfoContextInterface['sttLanguage'] = sttLanguage;
    if (!langChanged) return;
    const actionText =
      prevLang.indexOf('') !== -1
        ? `has set the spoken language to  "${getLanguageLabel(newLang)}" `
        : `changed the spoken language from "${getLanguageLabel(
            prevLang,
          )}" to "${getLanguageLabel(newLang)}" `;
    // const msg = `${
    //   //@ts-ignore
    //   defaultContentRef.current[uid]?.name || username
    // } ${actionText} `;
    let subheadingObj: any = {};
    if (prevLang.indexOf('') !== -1) {
      subheadingObj = {
        username: defaultContentRef.current[uid]?.name || username,
        action: prevLang.indexOf('') !== -1 ? 'Set' : 'Changed',
        newLanguage: getLanguageLabel(newLang),
      };
    } else {
      subheadingObj = {
        username: defaultContentRef.current[uid]?.name || username,
        action: prevLang.indexOf('') !== -1 ? 'Set' : 'Changed',
        newLanguage: getLanguageLabel(newLang),
        oldLanguage: getLanguageLabel(prevLang),
      };
    }

    Toast.show({
      leadingIconName: 'lang-select',
      type: 'info',
      text1: heading(prevLang.indexOf('') !== -1 ? 'Set' : 'Changed'),
      visibilityTime: 3000,
      primaryBtn: null,
      secondaryBtn: null,
      text2: subheading(subheadingObj),
    });
    setRoomInfo(prev => {
      return {
        ...prev,
        sttLanguage: {...sttLanguage, langChanged: false},
      };
    });
    // syncing local set language
    newLang && setLanguage(newLang);
    // add spoken lang msg to transcript
    setMeetingTranscript(prev => {
      return [
        ...prev,
        {
          name: 'langUpdate',
          time: new Date().getTime(),
          uid: `langUpdate-${uid}`,
          text: actionText,
        },
      ];
    });
    // start listening to stream Message callback
    addStreamMessageListener();
  }, [sttLanguage]);

  React.useEffect(() => {
    setIsSTTActive(isSTTActive);
  }, [isSTTActive]);

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

  const customLabel = (labelParam: ToolbarItemLabel) => {
    if (labelParam && typeof labelParam === 'string') {
      return labelParam;
    } else if (labelParam && typeof labelParam === 'function') {
      return labelParam(languageCode);
    } else {
      return null;
    }
  };

  const renderContent = (
    orderedKeys: string[],
    type: 'start' | 'center' | 'end',
  ) => {
    const renderContentItem = [];
    let index = 0;
    orderedKeys.forEach(keyName => {
      index = index + 1;
      let ToolbarComponent = null;
      let label = null;
      let onPress = null;
      let fieldsProps = null;
      if (type === 'start') {
        ToolbarComponent = startItems[keyName]?.component;
        label = startItems[keyName]?.label;
        onPress = startItems[keyName]?.onPress;
        if (keyName === 'more') {
          fieldsProps = startItems[keyName]?.fields;
        }
      } else if (type === 'center') {
        ToolbarComponent = centerItems[keyName]?.component;
        label = centerItems[keyName]?.label;
        onPress = centerItems[keyName]?.onPress;
        if (keyName === 'more') {
          fieldsProps = centerItems[keyName]?.fields;
        }
      } else {
        ToolbarComponent = endItems[keyName]?.component;
        label = endItems[keyName]?.label;
        onPress = endItems[keyName]?.onPress;
        if (keyName === 'more') {
          fieldsProps = endItems[keyName]?.fields;
        }
      }
      if (ToolbarComponent) {
        renderContentItem.push(
          <ToolbarComponent
            key={`top-toolbar-${type}` + index}
            fields={fieldsProps}
            label={customLabel(label)}
            onPress={onPress}
          />,
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
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  centerContent: {
    zIndex: 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  secondaryBtn: {marginLeft: 16, height: 40, paddingVertical: 5},
  primaryBtn: {
    maxWidth: 109,
    minWidth: 109,
    height: 40,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  primaryBtnText: {
    fontWeight: '600',
    fontSize: 16,
    paddingLeft: 0,
  },
});

export default Controls;

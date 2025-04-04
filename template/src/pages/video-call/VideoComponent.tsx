import React, {useContext, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import useLayoutsData from './useLayoutsData';
import {isArray, useIsDesktop, isValidReactComponent} from '../../utils/common';
import {PropsContext, ClientRoleType} from '../../../agora-rn-uikit';
import {useLayout} from '../../utils/useLayout';
import {useContent, useRoomInfo} from 'customization-api';
import {DefaultLayouts, getGridLayoutName} from './DefaultLayouts';
import {DispatchContext} from '../../../agora-rn-uikit';
import MeetingInfoGridTile from '../../components/meeting-info-invite/MeetingInfoGridTile';
import Spacer from '../../atoms/Spacer';
import {useLiveStreamDataContext} from '../../components/contexts/LiveStreamDataContext';
import {useCustomization} from 'customization-implementation';
import useMount from '../../components/useMount';

const VideoComponent = () => {
  const {dispatch} = useContext(DispatchContext);
  const [layout, setLayoutIndex] = useState(0);
  const layoutsData = useLayoutsData();
  const {currentLayout, setLayout} = useLayout();
  const {activeUids, pinnedUid} = useContent();
  const {rtcProps} = useContext(PropsContext);
  const isDesktop = useIsDesktop();
  const {audienceUids, hostUids} = useLiveStreamDataContext();
  const [showNoUserInfo, setShowNoUserInfo] = useState(false);
  const isCustomLayoutUsed = useCustomization(config => {
    if (
      typeof config?.components?.videoCall === 'object' &&
      config?.components?.videoCall?.customLayout
    ) {
      return true;
    }
    return false;
  });

  const {roomPreference} = useRoomInfo();

  const disableShareTile = roomPreference?.disableShareTile;
  const disableShareTileRef = useRef(disableShareTile);

  useMount(() => {
    //show share tile after 2.5 seconds because RTC user join take few seconds.
    //meanwhile we don't want to show the share tile
    setTimeout(() => {
      if (!disableShareTileRef.current) {
        setShowNoUserInfo(true);
      }
    }, 2500);
  });

  useEffect(() => {
    disableShareTileRef.current = disableShareTile;
    if (disableShareTile) {
      setShowNoUserInfo(false);
    }
  }, [disableShareTile]);

  const currentLayoutRef = useRef(currentLayout);
  const gridLayoutName = getGridLayoutName();
  useEffect(() => {
    if (activeUids && activeUids.length === 1 && !isCustomLayoutUsed) {
      if (pinnedUid) {
        dispatch({type: 'UserPin', value: [0]});
        dispatch({type: 'UserSecondaryPin', value: [0]});
      }
      if (currentLayoutRef.current != gridLayoutName) {
        setLayout(gridLayoutName);
      }
    }
  }, [activeUids, isCustomLayoutUsed]);

  useEffect(() => {
    currentLayoutRef.current = currentLayout;
    if (isArray(layoutsData)) {
      let index = layoutsData.findIndex(item => item.name === currentLayout);
      if (index >= 0) {
        setLayoutIndex(index);
      }
    }
  }, [currentLayout]);

  const showInviteTile = () => {
    if (
      $config.EVENT_MODE &&
      rtcProps.role == ClientRoleType.ClientRoleAudience
    ) {
      return false;
    }
    if (activeUids.length == 1) return true;
    return false;
  };

  if (
    layoutsData &&
    layoutsData[layout] &&
    isValidReactComponent(layoutsData[layout].component)
  ) {
    const CurrentLayout = layoutsData[layout].component;
    if (showInviteTile() && showNoUserInfo) {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: isDesktop() ? 'row' : 'column',
            justifyContent: 'space-between',
          }}>
          <CurrentLayout renderData={activeUids} />
          {((!$config.EVENT_MODE && activeUids.length === 1) ||
            ($config.EVENT_MODE &&
              hostUids.concat(audienceUids)?.length === 1)) &&
          (layoutsData[layout].name === DefaultLayouts[0].name ||
            layoutsData[layout].name === DefaultLayouts[1].name) ? (
            <>
              <Spacer size={8} horizontal={isDesktop() ? true : false} />
              <MeetingInfoGridTile />
            </>
          ) : (
            <></>
          )}
        </View>
      );
    }
    return <CurrentLayout renderData={activeUids} />;
  } else {
    return <></>;
  }
};
export default VideoComponent;

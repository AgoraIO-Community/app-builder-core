import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useRoomInfo} from '../../room-info/useRoomInfo';
import {useBreakoutRoom} from './../context/BreakoutRoomContext';
import BreakoutRoomSettings from './BreakoutRoomSettings';
import BreakoutRoomGroupSettings from './BreakoutRoomGroupSettings';
import ThemeConfig from '../../../theme';
import TertiaryButton from '../../../atoms/TertiaryButton';
import {BreakoutRoomHeader} from '../../../pages/video-call/SidePanelHeader';
import BreakoutRoomRaiseHand from './BreakoutRoomRaiseHand';
import BreakoutRoomMainRoomUsers from './BreakoutRoomMainRoomUsers';
import Loading from '../../../subComponents/Loading';

interface Props {
  closeSidePanel: () => void;
}
export default function BreakoutRoomView({closeSidePanel}: Props) {
  const [isInitializing, setIsInitializing] = useState(true);

  const {
    data: {isHost},
  } = useRoomInfo();

  const {
    checkIfBreakoutRoomSessionExistsAPI,
    createBreakoutRoomGroup,
    upsertBreakoutRoomAPI,
    closeAllRooms,
    permissions,
  } = useBreakoutRoom();

  useEffect(() => {
    const init = async () => {
      try {
        setIsInitializing(true);
        const activeSession = await checkIfBreakoutRoomSessionExistsAPI();
        if (!activeSession && isHost) {
          await upsertBreakoutRoomAPI('START');
        }
      } catch (error) {
        console.error('Failed to check breakout session:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  return (
    <>
      <BreakoutRoomHeader />
      <ScrollView
        style={[style.pannelOuterBody]}
        contentContainerStyle={
          isInitializing ? style.contentCenter : style.contentStart
        }>
        {isInitializing ? (
          <View style={style.panelInnerBody}>
            <Loading
              text={'Initializing...'}
              background={$config.CARD_LAYER_1_COLOR}
              textColor={$config.FONT_COLOR}
            />
          </View>
        ) : (
          <View style={style.panelInnerBody}>
            {permissions?.canRaiseHands ? <BreakoutRoomRaiseHand /> : <></>}
            {permissions?.canHostManageMainRoom &&
            permissions.canAssignParticipants ? (
              <BreakoutRoomSettings />
            ) : (
              <BreakoutRoomMainRoomUsers />
            )}
            <BreakoutRoomGroupSettings />
            {permissions?.canHostManageMainRoom &&
            permissions?.canCreateRooms ? (
              <TertiaryButton
                containerStyle={style.createBtnContainer}
                textStyle={style.createBtnText}
                text={'+ Create New Room'}
                onPress={() => createBreakoutRoomGroup()}
              />
            ) : (
              <></>
            )}
          </View>
        )}
      </ScrollView>
      {!isInitializing &&
      permissions.canHostManageMainRoom &&
      permissions?.canCloseRooms ? (
        <View style={style.footer}>
          <View style={style.fullWidth}>
            <TertiaryButton
              containerStyle={{
                borderColor: $config.SEMANTIC_ERROR,
              }}
              textStyle={{
                color: $config.SEMANTIC_ERROR,
              }}
              onPress={() => {
                try {
                  closeAllRooms();
                  closeSidePanel();
                } catch (error) {
                  console.error('Error while closing the room', error);
                }
              }}
              text={'Close All Rooms'}
            />
          </View>
        </View>
      ) : (
        <></>
      )}
    </>
  );
}

const style = StyleSheet.create({
  footer: {
    width: '100%',
    padding: 12,
    height: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: $config.CARD_LAYER_2_COLOR,
  },
  contentCenter: {
    height: '100%',
    justifyContent: 'center',
  },
  contentStart: {
    justifyContent: 'flex-start',
  },
  pannelOuterBody: {
    display: 'flex',
    flex: 1,
  },
  panelInnerBody: {
    display: 'flex',
    flex: 1,
    padding: 12,
    gap: 12,
  },
  fullWidth: {
    display: 'flex',
    flex: 1,
  },
  createBtnContainer: {
    backgroundColor: $config.INPUT_FIELD_BACKGROUND_COLOR,
    borderColor: $config.INPUT_FIELD_BORDER_COLOR,
    borderRadius: 8,
  },
  createBtnText: {
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    lineHeight: 20,
    fontWeight: '500',
    fontSize: ThemeConfig.FontSize.normal,
  },
});

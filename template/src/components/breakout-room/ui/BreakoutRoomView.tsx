import React, {useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useRoomInfo} from '../../room-info/useRoomInfo';
import {useBreakoutRoom} from './../context/BreakoutRoomContext';
import BreakoutRoomSettings from './BreakoutRoomSettings';
import BreakoutRoomGroupSettings from './BreakoutRoomGroupSettings';
import ThemeConfig from '../../../theme';
import TertiaryButton from '../../../atoms/TertiaryButton';
import {BreakoutRoomHeader} from '../../../pages/video-call/SidePanelHeader';
import BreakoutRoomRaiseHand from './BreakoutRoomRaiseHand';

interface Props {
  closeSidePanel: () => void;
}
export default function BreakoutRoomView({closeSidePanel}: Props) {
  const {
    data: {isHost},
  } = useRoomInfo();

  const {
    breakoutSessionId,
    checkIfBreakoutRoomSessionExistsAPI,
    createBreakoutRoomGroup,
    upsertBreakoutRoomAPI,
    closeAllRooms,
    isUserInRoom,
  } = useBreakoutRoom();

  useEffect(() => {
    const init = async () => {
      try {
        const activeSession = await checkIfBreakoutRoomSessionExistsAPI();
        if (!activeSession && isHost) {
          upsertBreakoutRoomAPI('START');
        }
      } catch (error) {
        console.error('Failed to check breakout session:', error);
      }
    };
    init();
  }, []);

  return (
    <>
      <BreakoutRoomHeader />
      <ScrollView style={[style.pannelOuterBody]}>
        <View style={style.panelInnerBody}>
          {!isHost && !isUserInRoom() ? <BreakoutRoomRaiseHand /> : <></>}
          {isHost ? <BreakoutRoomSettings /> : <></>}
          <BreakoutRoomGroupSettings />
          {isHost ? (
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
      </ScrollView>
      {isHost && breakoutSessionId ? (
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
                  console.error('Supriya Error while closing the room', error);
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

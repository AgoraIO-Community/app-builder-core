import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useRef} from 'react';
import BottomSheet, {
  BottomSheetProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import LocalAudioMute, {
  LocalAudioMuteProps,
} from '../../subComponents/LocalAudioMute';
import LocalVideoMute, {
  LocalVideoMuteProps,
} from '../../subComponents/LocalVideoMute';
import LocalEndcall, {
  LocalEndcallProps,
} from '../../subComponents/LocalEndCall';
import {ButtonTemplateName} from '../../utils/useButtonTemplate';
import Styles from '../../components/styles';
import {ImageIcon} from 'agora-rn-uikit';
import CopyJoinInfo from '../../subComponents/CopyJoinInfo';
import LocalSwitchCamera from '../../subComponents/LocalSwitchCamera';
import Recording from '../../subComponents/Recording';
import {ChatIconButton, ParticipantsIconButton} from '../../components/Navbar';

//topbar btn template is used to show icons without label text (as in desktop : bottomBar)

const ActionSheet = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
    bottomSheetRef.current?.snapToIndex(index);
    index === 0 ? setIsExpanded(false) : setIsExpanded(true);
  }, []);

  return (
    <BottomSheet
      snapPoints={['15%', '50%']}
      ref={bottomSheetRef}
      onChange={handleSheetChanges}
      style={styles.container}
      backgroundStyle={styles.backgroundStyle}
      handleIndicatorStyle={styles.handleIndicatorStyle}>
      <BottomSheetView>
        <View style={[styles.row, {borderBottomWidth: 1}]}>
          <View style={styles.iconContainer}>
            <LocalVideoMute buttonTemplateName={ButtonTemplateName.actionBar} />
          </View>
          <View style={[styles.iconContainer]}>
            <LocalAudioMute buttonTemplateName={ButtonTemplateName.actionBar} />
          </View>
          <View style={[styles.iconContainer, {backgroundColor: '#FF414D'}]}>
            <LocalEndcall buttonTemplateName={ButtonTemplateName.actionBar} />
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              onPress={() => handleSheetChanges(isExpanded ? 0 : 1)}>
              <ImageIcon
                name={isExpanded ? 'downArrow' : 'more'}
                style={Styles.actionSheetButton}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.row}>
          {/* chat */}
          <View style={styles.iconWithText}>
            <View style={styles.iconContainer}>
              <ImageIcon name={'chat'} style={Styles.actionSheetButton} />
            </View>
            <Text style={styles.iconText}>Chat</Text>
          </View>
          {/* participants */}
          <View style={styles.iconWithText}>
            <View style={styles.iconContainer}>
              <ImageIcon
                name={'participant'}
                style={Styles.actionSheetButton}
              />
              {/* <ParticipantsIconButton /> */}
            </View>
            <Text style={styles.iconText}>Participants</Text>
          </View>
          {/* record */}
          <View style={styles.iconWithText}>
            <View style={styles.iconContainer}>
              <Recording buttonTemplateName={ButtonTemplateName.actionBar} />
            </View>
            <Text style={styles.iconText}>Record</Text>
          </View>

          {/* switch camera */}
          <View style={styles.iconWithText}>
            <View style={styles.iconContainer}>
              <LocalSwitchCamera
                buttonTemplateName={ButtonTemplateName.actionBar}
              />
            </View>
            <Text style={styles.iconText}>Switch {'\n'} Camera</Text>
          </View>
        </View>
        <View style={styles.row}>
          {/* List view */}
          <View style={styles.iconWithText}>
            <View style={styles.iconContainer}>
              <ImageIcon name={'listView'} style={Styles.actionSheetButton} />
            </View>
            <Text style={styles.iconText}>List View</Text>
          </View>
          {/* settings */}
          <View style={styles.iconWithText}>
            <View style={styles.iconContainer}>
              <ImageIcon name={'settings'} style={Styles.actionSheetButton} />
            </View>
            <Text style={styles.iconText}>Settings</Text>
          </View>
          {/* invite */}
          <View style={styles.iconWithText}>
            <View style={styles.iconContainer}>
              <CopyJoinInfo buttonTemplateName={ButtonTemplateName.actionBar} />
            </View>
            <Text style={styles.iconText}>Invite</Text>
          </View>

          <View style={styles.emptyContainer}></View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default ActionSheet;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderColor: '#EDF0F1',
    flexWrap: 'wrap',
  },
  iconContainer: {
    backgroundColor: '#F0F4F6', //TODO : adjust color as theme
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    width: 50,
    height: 50,
  },
  container: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backgroundStyle: {
    backgroundColor: '#FFF', //TODO: to be derived from configs for dark theme
  },

  handleIndicatorStyle: {
    backgroundColor: '#A0B9CA',
    width: 40,
    height: 4,
  },
  iconWithText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: $config.PRIMARY_COLOR,
    marginTop: 8,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
    textAlign: 'center',
  },
});

import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import ImageIcon from '../../atoms/ImageIcon';
import LocalAudioMute, {
  LocalAudioMuteProps,
} from '../../subComponents/LocalAudioMute';
import LocalVideoMute, {
  LocalVideoMuteProps,
} from '../../subComponents/LocalVideoMute';
import LocalEndcall, {
  LocalEndcallProps,
} from '../../subComponents/LocalEndCall';
import CopyJoinInfo from '../../subComponents/CopyJoinInfo';
import LocalSwitchCamera from '../../subComponents/LocalSwitchCamera';
import Recording from '../../subComponents/Recording';

const ActionSheetContent = (props) => {
  const {handleSheetChanges, updateActionSheet, isExpanded} = props;
  return (
    <View>
      <View style={[styles.row, {borderBottomWidth: 1}]}>
        <View style={styles.iconContainer}>
          <LocalVideoMute hideLabel />
        </View>
        <View style={[styles.iconContainer]}>
          <LocalAudioMute hideLabel />
        </View>
        <View style={[styles.iconContainer, {backgroundColor: '#FF414D'}]}>
          <LocalEndcall hideLabel />
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity
            onPress={() => handleSheetChanges(isExpanded ? 0 : 1)}>
            <ImageIcon
              name={isExpanded ? 'arrow-down' : 'more-menu'}
              tintColor={$config.PRIMARY_COLOR}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.row}>
        {/* chat */}
        <View style={styles.iconWithText}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => updateActionSheet('chat')}>
            <ImageIcon name={'chat'} tintColor={$config.PRIMARY_COLOR} />
          </TouchableOpacity>
          <Text style={styles.iconText}>Chat</Text>
        </View>
        {/* participants */}
        <View style={styles.iconWithText}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => updateActionSheet('participants')}>
            <ImageIcon
              name={'participants'}
              tintColor={$config.PRIMARY_COLOR}
            />
            {/* <ParticipantsIconButton /> */}
          </TouchableOpacity>
          <Text style={styles.iconText}>Participants</Text>
        </View>
        {/* record */}
        <View style={styles.iconWithText}>
          <View style={styles.iconContainer}>
            <Recording hideLabel />
          </View>
          <Text style={styles.iconText}>Record</Text>
        </View>

        {/* switch camera */}
        <View style={styles.iconWithText}>
          <View style={styles.iconContainer}>
            <LocalSwitchCamera hideLabel />
          </View>
          <Text style={styles.iconText}>Switch {'\n'} Camera</Text>
        </View>
      </View>
      <View style={styles.row}>
        {/* List view */}
        <View style={styles.iconWithText}>
          <View style={styles.iconContainer}>
            <ImageIcon name={'list-view'} tintColor={$config.PRIMARY_COLOR} />
          </View>
          <Text style={styles.iconText}>List View</Text>
        </View>
        {/* settings */}
        <View style={styles.iconWithText}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => updateActionSheet('settings')}>
            <ImageIcon name={'settings'} tintColor={$config.PRIMARY_COLOR} />
          </TouchableOpacity>
          <Text style={styles.iconText}>Settings</Text>
        </View>
        {/* invite */}
        <View style={styles.iconWithText}>
          <View style={styles.iconContainer}>
            <CopyJoinInfo hideLabel />
          </View>
          <Text style={styles.iconText}>Invite</Text>
        </View>

        <View style={styles.emptyContainer}></View>
      </View>
    </View>
  );
};

export default ActionSheetContent;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderColor: $config.CARD_LAYER_3_COLOR,
    flexWrap: 'wrap',
  },
  iconContainer: {
    backgroundColor: $config.CARD_LAYER_2_COLOR,
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
    color: $config.PRIMARY_ACTION_BRAND_COLOR,
    marginTop: 8,
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Source Sans Pro',
    textAlign: 'center',
  },
});

import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useContext} from 'react';
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
import ChatContext from '../../components/ChatContext';
import {numFormatter} from '../../utils';
import IconButton from '../../atoms/IconButton';
import {useLayout} from '../../utils/useLayout';
import useLayoutsData from '../../pages/video-call/useLayoutsData';
import {useChangeDefaultLayout} from '../../pages/video-call/DefaultLayouts';

const ActionSheetContent = (props) => {
  const {handleSheetChanges, updateActionSheet, isExpanded} = props;
  const {onlineUsersCount} = useContext(ChatContext);
  const layouts = useLayoutsData();
  const {currentLayout} = useLayout();
  const changeLayout = useChangeDefaultLayout();
  const layout = layouts.findIndex((item) => item.name === currentLayout);

  const handleLayoutChange = () => {
    console.warn('current layout', layouts[layout]?.iconName);
    changeLayout();
  };
  return (
    <View>
      <View style={[styles.row, {borderBottomWidth: 1}]}>
        <View style={styles.iconContainer}>
          <LocalVideoMute showLabel={false} />
        </View>
        <View style={[styles.iconContainer]}>
          <LocalAudioMute showLabel={false} />
        </View>
        <View style={[styles.iconContainer, {backgroundColor: '#FF414D'}]}>
          <LocalEndcall showLabel={false} />
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
          <Text style={styles.iconText}>
            Participants {'\n'} ({numFormatter(onlineUsersCount)})
          </Text>
        </View>
        {/* record */}
        <View style={styles.iconWithText}>
          <View style={styles.iconContainer}>
            <Recording showLabel={false} />
          </View>
          <Text style={styles.iconText}>Record</Text>
        </View>

        {/* switch camera */}
        <View style={styles.iconWithText}>
          <View style={styles.iconContainer}>
            <LocalSwitchCamera showLabel={false} />
          </View>
          <Text style={styles.iconText}>Switch {'\n'} Camera</Text>
        </View>
      </View>
      <View style={styles.row}>
        {/* List view */}
        <View style={styles.iconWithText}>
          <View style={styles.iconContainer}>
            <IconButton
              onPress={handleLayoutChange}
              iconProps={{
                name:
                  layouts[layout]?.iconName === 'grid-layout'
                    ? 'layout'
                    : 'list-view',
                tintColor: $config.PRIMARY_COLOR,
              }}
            />
            {/* layout */}
          </View>
          <Text style={styles.iconText}>Layout</Text>
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
            <CopyJoinInfo showLabel={false} />
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

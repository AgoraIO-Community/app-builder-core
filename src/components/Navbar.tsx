import React, {useContext} from 'react';
import {View, TouchableOpacity, Image, Text} from 'react-native';
import styles from './styles';
import {MinUidConsumer} from '../../agora-rn-uikit/src/MinUidContext';
import PropsContext from '../../agora-rn-uikit/src/PropsContext';
import icons from '../assets/icons';

const {
  participantIcon,
  gridLayoutIcon,
  pinnedLayoutIcon,
  recordingIcon,
  threeDotsIcon,
} = icons;

const Navbar = (props) => {
  const {rtcProps} = useContext(PropsContext);
  const participantsView = props.participantsView;
  const setParticipantsView = props.setParticipantsView;
  const hostControlView = props.hostControlView;
  const setHostControlView = props.setHostControlView;
  const layout = props.layout;
  const setLayout = props.setLayout;
  const recordingActive = props.recordingActive;

  return (
    <View style={styles.navbar}>
      <View style={styles.participantNav}>
        <TouchableOpacity
          onPress={() => {
            setParticipantsView(!participantsView);
          }}
          style={styles.participantButton}>
          <Image
            source={{uri: participantIcon}}
            style={styles.participantIcon}
          />
          <MinUidConsumer>
            {(minUsers) => (
              <Text style={styles.participantNavText}>
                {minUsers.length + 1}
              </Text>
            )}
          </MinUidConsumer>
        </TouchableOpacity>
      </View>
      <View style={styles.roomNameContainer}>
        <Text style={styles.roomNameText}>Room: {rtcProps.channel}</Text>
      </View>
      {recordingActive ? (
        <View style={styles.recordingNav}>
          <View style={styles.participantButton}>
            <Image source={{uri: recordingIcon}} style={styles.recordingIcon} />
            <Text style={styles.participantNavText}>Recording</Text>
          </View>
        </View>
      ) : (
        <></>
      )}
      <View style={styles.hostControlButtonHolder}>
        <TouchableOpacity
          onPress={() => {
            setLayout(!layout);
          }}
          style={styles.layoutButton}>
          <Image
            source={{uri: layout ? gridLayoutIcon : pinnedLayoutIcon}}
            style={styles.participantIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setHostControlView(!hostControlView)}
          style={styles.threeDots}>
          <Image source={{uri: threeDotsIcon}} style={styles.participantIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Navbar;

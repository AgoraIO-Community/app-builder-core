import React from 'react';
import {View, TouchableOpacity, Image, Text} from 'react-native';
import styles from '../components/styles';
import {MinUidConsumer} from '../agora-rn-uikit/src/MinUidContext';
import { recordingIcon } from './Recording';
const Navbar = (props) => {
  const participantsView = props.participantsView;
  const setParticipantsView = props.setParticipantsView;
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
              <Text style={styles.participantNavText}>{minUsers.length}</Text>
            )}
          </MinUidConsumer>
        </TouchableOpacity>
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
    </View>
  );
};

const participantIcon =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAVFBMVEUAAAC/v7+qqqqSkpKenp6ioqKfn6KhoaOfn6GgoKKhoaKgoKKhoaOgoKKgoKKgoKKgoKKgoKGgoKKgoKKgoKKgoKGgoKKgoKKgoKKgoKKgoKL///9uLwqLAAAAGnRSTlMABAYHFSxgb4WGh4mKjJyfoanW4eLl5ufz9wm/dlQAAAABYktHRBsCYNSkAAAAaklEQVQoz8XNyQ6AIAxF0ScoDuCEisL/f6iSVKobF244mxvapADZSeOcFtzEhEvLTfY4WLmJi4OFm+g4aLj8ud62TnB/K9Vsj8POqgRqarzf+0C8kRiowBQeRlRUwD8XHgUVCC/3+2uR0QkwDA/P7IAPngAAAABJRU5ErkJggg==';
const gridLayoutIcon =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYAQMAAADaua+7AAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAAAFiS0dEAf8CLd4AAAAUSURBVAjXY2DAAuS+70HBpIihAQAPdBXNL4qtZAAAAABJRU5ErkJggg==';
const pinnedLayoutIcon =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYAQMAAADaua+7AAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAAAFiS0dEAf8CLd4AAAAYSURBVAjXY2DAAuT//8GKwXL7/+DEWAAA1Q8Zk8SHlY8AAAAASUVORK5CYII=';

export default Navbar;

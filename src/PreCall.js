/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Picker, Platform, StatusBar, TextInput } from 'react-native';

const App = () => {
  const [selectedMicValue, setSelectedMicValue] = useState('im');
  const [selectedCamValue, setSelectedCamValue] = useState('wc');
  const [activePreset, setActivePreset] = useState(1);
  const [username, onChangeUsername] = useState(undefined);

  return (
    <View style={styles.mainContainer}>
      <StatusBar hidden />
      <View style={styles.topSpacer} />
      <View style={styles.containerTop}>
        {Platform.OS === 'web' ? (
          <View style={styles.containerTopLeft}>
            <View style={styles.pickerContainer}>
              <TouchableOpacity style={styles.button} />
              <Picker
                selectedValue={selectedCamValue}
                style={styles.picker}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedCamValue(itemValue)
                }>
                <Picker.Item label="WebCam" value="wc" />
                <Picker.Item label="External Camera" value="ec" />
              </Picker>
            </View>
            <View style={styles.pickerContainer}>
              <TouchableOpacity style={styles.button} />
              <Picker
                selectedValue={selectedMicValue}
                style={styles.picker}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedMicValue(itemValue)
                }>
                <Picker.Item label="Internal Mic" value="im" />
                <Picker.Item label="Headset" value="h" />
              </Picker>
            </View>
          </View>
        ) : (
          <></>
        )}

        <View style={styles.containerTopRight}>
          <View style={styles.tempImage} />
          <TextInput
            style={styles.textBox}
            value={username}
            onChangeText={(text) => onChangeUsername(text)}
            placeholder="Enter your name"
            placeholderTextColor="#ddd"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.containerBottom}>
        {Platform.OS !== 'web' ? (
          <View style={styles.muteButtons}>
            <TouchableOpacity style={styles.button} />
            <TouchableOpacity style={styles.button} />
          </View>
        ) : (
          <></>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={
              activePreset === 0
                ? styles.qualityButtonActive
                : styles.qualityButton
            }
            onPress={() => setActivePreset(0)}>
            <Text
              style={
                activePreset === 0
                  ? styles.qualityButtonTextActive
                  : styles.qualityButtonText
              }>
              360p
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              activePreset === 1
                ? styles.qualityButtonActive
                : styles.qualityButton
            }
            onPress={() => setActivePreset(1)}>
            <Text
              style={
                activePreset === 1
                  ? styles.qualityButtonTextActive
                  : styles.qualityButtonText
              }>
              480p
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              activePreset === 2
                ? styles.qualityButtonActive
                : styles.qualityButton
            }
            onPress={() => setActivePreset(2)}>
            <Text
              style={
                activePreset === 2
                  ? styles.qualityButtonTextActive
                  : styles.qualityButtonText
              }>
              720p
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    //backgroundImage: 'linear-gradient(0deg, #0076D6, #02BFFC)',
    backgroundColor: '#333237',
    padding: '3%',
  },
  topSpacer: {
    flex: 0.5,
    flexDirection: 'row',
  },
  containerTop: {
    flex: 5,
    flexDirection: 'row',
  },
  containerTopLeft: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    height: '20%',
    width: '80%',
    flexDirection: 'row',
    marginVertical: '3%',
  },
  button: {
    height: '80%',
    minWidth: 50,
    minHeight: 50,
    maxWidth: 60,
    maxHeight: 60,
    flex: 1,
    backgroundColor: '#FCFDFD',
    marginHorizontal: '10%',
  },
  picker: {
    height: '80%',
    minHeight: 50,
    width: '70%',
    backgroundColor: '#6E757B',
    borderWidth: 0,
    color: '#fff',
    paddingHorizontal: 10,
  },
  containerTopRight: {
    flex: 1,
  },
  tempImage: {
    flex: 1,
    marginVertical: '5%',
    marginHorizontal: '15%',
    backgroundColor: '#111',
  },
  textBox: {
    width: '80%',
    textAlign: 'center',
    alignSelf: 'center',
    backgroundColor: '#6E757B',
    color: '#fff',
    marginBottom: 15,
    maxWidth: 500,
    minHeight: 40,
    fontSize: 18,
  },
  containerBottom: {
    flex: 4,
    paddingHorizontal: '7%',
    alignItems: 'center',
  },
  muteButtons: {
    flex: 1,
    flexDirection: 'row',
  },
  buttonContainer: {
    width: '80%',
    flex: 0.5,
    flexDirection: 'row',
    minHeight: 40,
    paddingVertical: '2%',
  },
  qualityButton: {
    backgroundColor: '#6E757B',
    flex: 1,
    borderColor: '#fff',
    minHeight: 40,
    maxHeight: '50%',
    textAlign: 'center',
    justifyContent: 'center',
  },
  qualityButtonActive: {
    backgroundColor: '#FCFDFD',
    flex: 1,
    minHeight: 40,
    maxHeight: '50%',
    borderColor: '#fff',
    textAlign: 'center',
    justifyContent: 'center',
  },
  qualityButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  qualityButtonTextActive: {
    color: '#333',
    fontSize: 18,
    textAlign: 'center',
  },
  joinButton: {
    width: '40%',
    flex: 2,
    flexDirection: 'row',
    minHeight: 40,
    height: '100%',
    minWidth: 300,
    maxHeight: '20%',
    marginTop: '0%',
    marginBottom: '8%',
    backgroundColor: '#FCFDFD',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#333',
    fontSize: 18,
    alignSelf: 'center',
  },
});

export default App;

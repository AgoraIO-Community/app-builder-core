import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import PrimaryButton from '../atoms/PrimaryButton';
import TertiaryButton from '../atoms/TertiaryButton';
import Spacer from '../atoms/Spacer';
import {Logo} from '../components/common';
import {useHistory} from '../components/Router';
import StorageContext from '../components/StorageContext';
import ThemeConfig from '../theme';

const Timer = () => {
  const [seconds, setSeconds] = useState(60);
  const history = useHistory();
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setSeconds((seconds) => seconds - 1);
    }, 1000);
    return () => {
      clearInterval(timerInterval); //when user exits, clear this interval.
    };
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      history.push('/');
    }
  }, [seconds]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'center',
        borderColor: $config.PRIMARY_ACTION_BRAND_COLOR,
        borderWidth: 3,
        borderRadius: 30,
      }}>
      <Text
        style={{
          minHeight: 40,
          minWidth: 40,
          padding: 12,
          fontFamily: ThemeConfig.FontFamily.sansPro,
          fontWeight: '700',
          fontSize: 14,
          lineHeight: 18,
          textAlign: 'center',
          color: $config.FONT_COLOR,
        }}>
        {seconds}
      </Text>
    </View>
  );
};

const Endcall = () => {
  const leftMeetingLabel = 'You have left the meeting.';
  const rejoinBtnLabel = 'REJOIN';
  const createMeetingLabel = 'START NEW MEETING';
  const returnToHomeLabel = 'Returning to the home screen';
  const {store} = useContext(StorageContext);
  const history = useHistory();
  const reJoin = () => {
    history.push(store.lastMeetingPhrase);
  };
  const goToCreate = () => {
    history.push('/');
  };
  return (
    <View style={styles.main}>
      <View style={styles.contentContainer}>
        <Logo />
        <Spacer size={20} />
        <Text style={styles.heading}>{leftMeetingLabel}</Text>
        <Spacer size={40} />
        <View style={styles.btnContainer}>
          <View style={{justifyContent: 'center', alignSelf: 'center'}}>
            <TertiaryButton
              containerStyle={{
                height: 60,
                justifyContent: 'center',
              }}
              text={rejoinBtnLabel}
              onPress={() => {
                reJoin();
              }}
            />
          </View>
          <View
            style={{
              marginLeft: 16,
              justifyContent: 'center',
              alignSelf: 'center',
            }}>
            <PrimaryButton
              containerStyle={{height: 60}}
              text={createMeetingLabel}
              onPress={() => {
                goToCreate();
              }}
            />
          </View>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <Timer />
        <Spacer size={10} />
        <Text style={styles.returnHomeText}>{returnToHomeLabel}</Text>
      </View>
    </View>
  );
};

export default Endcall;

const styles = StyleSheet.create({
  returnHomeText: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '400',
    fontSize: ThemeConfig.FontSize.small,
    lineHeight: 18,
    color: $config.FONT_COLOR,
    textAlign: 'center',
  },
  bottomContainer: {
    marginBottom: 28,
  },
  main: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainer: {
    flexDirection: 'row',
  },
  heading: {
    fontFamily: ThemeConfig.FontFamily.sansPro,
    fontWeight: '600',
    fontSize: 40,
    lineHeight: 40,
    color: $config.FONT_COLOR,
  },
});

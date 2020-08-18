import {Platform, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

const styles = {
  main: {
    flex: 1,
    backgroundColor: '#333237',
    flexDirection: 'column',
    paddingHorizontal: Platform.OS === 'web' ? '1%' : 0,
  },
  full: {
    flex: 1,
  },
  whiteText: {
    color: '#fff',
  },
  blackText: {
    color: '#000',
  },
  navbar: {
    flex: 1,
    backgroundColor: '#333237',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  participantNav: {
    backgroundColor: '#565658',
    flex: 0.2,
    maxWidth: 65,
    paddingHorizontal: 5,
    marginHorizontal: 5,
    height: 35,
    maxHeight: 30,
    alignSelf: 'center',
    // marginVertical: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    borderRadius: 3,
  },
  participantNavText: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    color: '#fff',
    fontWeight: '400',
    alignSelf: 'center',
    textAlign: 'center',
    flex: 1,
  },
  roomNameContainer: {
    paddingHorizontal: 5,
    marginHorizontal: 5,
    height: 35,
    maxHeight: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
  },
  roomNameText: {
    fontSize:18,
    color:'#fff',
  },
  recordingNav: {
    backgroundColor: '#FF6A6B',
    flex: .8,
    maxWidth: 150,
    paddingHorizontal: 2,
    height: 35,
    maxHeight: 30,
    alignSelf: 'center',
    // marginVertical: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    borderRadius: 3,
    marginHorizontal: 5,
  },
  recordingNavText: {
    fontSize: Platform.OS === 'web' ? 19 : 17,
    color: '#fff',
    fontWeight: '400',
    alignSelf: 'center',
    textAlign: 'center',
    flex: .8,
    lineHeight: 35,
  },
  participantButton: {
    height: '80%',
    width: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  layoutButton: {
    height: '90%',
    alignSelf: 'center',
    width: 40,
    marginRight: 5,
  },
  threeDots: {
    height: '60%',
    alignSelf: 'center',
    width: 40,
    marginRight: 5,
  },
  participantIcon: {
    flex: 1,
    margin: 1,
    resizeMode: 'contain',
  },
  recordingIcon: {
    flex: 0.3,
    margin: 1,
    resizeMode: 'contain',
  },
  videoView: {
    flex: 12,
    backgroundColor: '#333237',
    flexDirection: 'column',
  },
  videoViewInner: {
    flex: 8,
  },
  bottomBar: {
    flex: Platform.OS === 'web' ? 1.3 : 1.6,
    paddingHorizontal: Platform.OS === 'web' ? '20%' : '1%',
    backgroundColor: '#333237',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    position: 'relative',
    margin: 0,
    bottom: 0,
  },
  checkboxHolder: {
    marginVertical: 20,
  },
  checkboxView: {
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paddedText: {
    color: '#fff',
    paddingHorizontal: 5,
  },
  subHeadingText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 2,
  },
  temp: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333237',
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
  },
  gridVideoContainer: {
    flex: 1,
    backgroundColor: '#333237',
    marginHorizontal: 'auto',
  },
  gridVideoContainerInner: {
    borderColor: '#eee',
    borderWidth:2,
    flex: 1,
    margin:2,
  },
  bottomBarButton: {
    height: '70%',
    width: 60,
    backgroundColor: '#6D767D',
  },
  participantView: {
    width: Platform.OS === 'web' ? '25%' : '50%',
    // minWidth: Platform.OS === 'web' ? '25%' : '50%',
    height: '100%',
    backgroundColor: '#6E757D',
    zIndex: 20,
    position: 'absolute',
  },
  hostControlView: {
    marginLeft: Platform.OS === 'web' ? '75%' : '50%',
    justifyContent: 'center',
    width: Platform.OS === 'web' ? '25%' : '50%',
    height: '25%',
    backgroundColor: '#333237',
    zIndex: 20,
    position: 'absolute',
  },
  participantContainer: {
    flexDirection: 'row',
    flex: 0.1,
    backgroundColor: '#6E757D',
    height: '15%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 22 : 17,
    flexDirection: 'row',
    color: '#fff',
    lineHeight: 20,
    paddingLeft: 10,
    alignSelf: 'center',
  },
  participantCountTextHolder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantCountText: {
    fontSize: Platform.OS === 'web' ? 24 : 16,
    color: '#ABABAB',
    fontWeight: '500',
  },
  participantMicButton: {
    width: 17,
    height: 17,
    backgroundColor: '#777',
    marginTop: 10,
    marginLeft: 10,
  },
  participantButtonContainer: {
    // flex: 0.3,
    flexDirection: 'row',
    paddingRight: 10,
    alignSelf: 'center',
    alignItems: 'center',
  },
  pinnedView: {
    flex: 2,
    backgroundColor: '#333237',
    flexDirection: 'row',
  },
  pinnedVideo: {
    flex: 1,
    borderColor: '#eee',
    borderWidth:2
  },
  participantCountInner: {
    width: width / 7.5,
    height: width / 7.5,
    maxHeight: 100,
    maxWidth: 100,
    textAlignVertical: 'center',
    backgroundColor: '#444',
    borderRadius: width / 6,
    alignItems: 'center',
    marginHorizontal: 15,
    alignSelf: 'center',
  },
  localButton: {
    backgroundColor: '#6E757D',
    borderRadius: 2,
    borderColor: '#6E757D',
    width: 46,
    height: 46,
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCall: {
    backgroundColor: '#F86051',
    borderRadius: 2,
    borderColor: '#F86051',
    width: 46,
    height: 46,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenLocalButton: {
    backgroundColor: '#4BEB5B',
    borderRadius: 2,
    borderColor: '#F86051',
    width: 46,
    height: 46,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remoteViewTouchable: {
    width: width / 4,
    // borderRadius: 10,
    borderColor: '#fff',
    borderWidth: .8,
    marginHorizontal: 4,
    marginVertical: 10,
    zIndex: 40,
  },
  remoteViewTouchableWeb: {
    width: width / 8,
    marginRight: 10,
    marginVertical: 8,
    zIndex: 40,
  },
  remoteButton: {
    width: 25,
    height: 25,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 0,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    marginHorizontal: 0,
    backgroundColor: '#6E757D',
  },
  minCloseBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 25,
    height: 25,
    borderRadius: 0,
    position: 'absolute',
    right: 5,
    top: 5,
  },
  remoteBtnContainer: {
    bottom: 0,
    position: 'absolute',
    marginVertical: 0,
    marginBottom: 5,
  },
  callCompleteText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 26 : 22,
    flexDirection: 'row',
    color: '#fff',
    lineHeight: Platform.OS === 'web' ? 26 : 22,
    marginTop: '10%',
    alignSelf: 'center',
  },
  participantsButton: {
    height: '80%',
    width: 40,
    marginHorizontal: 20,
  },
  buttonIconMic: {
    width: 22,
    height: 20,
    tintColor: '#fff',
  },
  buttonIconCam: {
    width: 25,
    height: 25,
    marginHorizontal: 3,
    tintColor: '#fff',
  },
  buttonIconEnd: {
    width: 25,
    height: 25,
    marginLeft: 3,
    tintColor: '#f86051',
  },
  maxVideoContainer: {
    flex: 1,
    margin: 5,
  },
  participantsView: {
    width: Platform.OS === 'web' ? '25%' : '50%',
    height: '100%',
    backgroundColor: '#6E757D',
    zIndex: 20,
    position: 'absolute',
  },
  participantsText: {
    flex: 1,
    fontSize: Platform.OS === 'web' ? 22 : 17,
    flexDirection: 'row',
    color: '#fff',
    lineHeight: 20,
    paddingLeft: 10,
    alignItems: 'center',
    alignSelf: 'center',
  },
  participantsMicButton: {
    width: 17,
    height: 17,
    backgroundColor: '#777',
    marginTop: 10,
    marginLeft: 10,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#009DEC',
  },
  mainContainerWeb: {
    flex: 1,
    backgroundColor: '#009DEC',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#ff0000',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginHorizontal: 40,
  },
  meetingDetailsContainer: {
    flex: 1,
    alignContent: 'center',
    alignSelf: Platform.OS === 'web' ? 'center': undefined,
    justifyContent: 'center',
    marginHorizontal: 40,
  },
  buttonText: {
    width: '100%',
    height: 45,
    lineHeight: 45,
    fontSize: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#fff',
  },
  textBox: {
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#fff',
    color: '#099DFD',
    fontSize: 20,
    marginBottom: 15,
    maxWidth: 400,
    minHeight: 45,
  },
  urlTextView: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent:'center',
    maxWidth: 400,
    minHeight: 45,
  },
  urlText: {
    color: '#099DFD',
    fontSize: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#099DFD',
    maxWidth: 400,
    minHeight: 45,
    marginBottom: 15,
  },
  hr: {
    borderBottomColor: '#fff',
    borderBottomWidth: 1,
    width: '100%',
    marginBottom: 15,
    maxWidth: 200,
  },
  buttonDark: {
    width: '80%',
    backgroundColor: '#6E757D',
    maxWidth: 400,
    alignSelf: 'center',
    marginBottom: '10%',
  },
  hostControlButton: {
    width: '80%',
    backgroundColor: '#6E757D',
    alignSelf: 'center',
    justifyContent: 'center',
    marginVertical: '5%',
  },
  hostControlButtonHolder: {
    width: 80,
    height: '100%',
    flexDirection: 'row',
    marginLeft: 'auto',
    marginRight: 1,
  },
  icons: {
    tintColor: '#fff',
    width: 220,
    height: 35,
    alignSelf: 'center',
    marginBottom: 50,
  },
  logo: {
    tintColor: '#fff',
    width: 200,
    height: 70,
    alignSelf: 'center',
    marginBottom: 50,
  },
  headingText: {
    color: '#fff',
    fontSize: 36,
    marginBottom: 10,
    fontWeight: '500',
  },
  buttonIcon:{
    width: 25,
    height: 25,
    tintColor: '#fff',
  },
  chatWeb: {
    backgroundColor: '#E8ECF4',
    position: 'absolute',
    width: '20%',
    height: '80%',
    zIndex: 3,
    display: 'flex',
    right: 10,
    bottom: 0,
    flex: 1,
  },
  chatNative: {
    backgroundColor: '#E8ECF4',
    position: 'absolute',
    width: '100%',
    height: '89%',
    zIndex: 3,
    display: 'flex',
    right: 0,
    top: 0,
    flex: 1,
  },
  chatNav: {
    backgroundColor: '#D1D5DF',
    width: '100%',
    height: '7%',
    paddingLeft: 10,
  },
  chatNavText: {
    marginVertical: 'auto',
    fontWeight: '700',
    color: '#555',
    fontSize: 25,
    justifyContent: 'center',
  },
  chatInputView: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 5,
    backgroundColor: '#fff',
  },
  chatInput: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    color: '#000',
    marginLeft: 10,
  },
  ChatInputButton: {
    width: 30,
    height: 30,
    borderRadius: 35,
    marginVertical: 'auto',
    alignSelf:'center',
    marginHorizontal: 10,
    backgroundColor: '#343944',
    display: 'flex',
    justifyContent:'center',
  },
  ChatInputButtonText: {
    color: '#fff',
    justifyContent:'center',
    alignSelf:'center',
  },
  chatSenderView: {
    flex: 2,
    marginVertical: 2,
    flexDirection: 'row',
    marginRight: 30,
    marginLeft: 15,
  },
  chatSenderViewLocal: {
    flex: 2,
    marginVertical: 2,
    flexDirection: 'row',
    marginRight: 15,
    marginLeft: 30,
  },
  chatSenderText: {
    color: '#000',
    paddingRight: 10,
    fontWeight: '700',
  },
  chatBubble: {
    backgroundColor: '#fff',
    flex: 1,
    display: 'flex',
    marginVertical: 5,
    padding: 10,
    marginRight: 30,
    marginLeft: 15,
  },
  chatBubbleLocal: {
    backgroundColor: '#0884FF',
    flex: 1,
    display: 'flex',
    marginVertical: 5,
    padding: 10,
    marginRight: 15,
    marginLeft: 30,
  },
  popupView: {
    position: 'absolute',
    top: '-400%',
    left: '20%',
    width: '60%',
    height: '350%',
    backgroundColor: '#333237',
    justifyContent: 'space-evenly',
    alignContent: 'center',
    paddingVertical: 5,
  },
  popupText: {
    width: '100%',
    fontSize: 24,
    textAlign: 'center',
    color: '#fff',
  },
  popupPicker: {
    height: '40%',
    width: '50vw',
    alignSelf: 'center',
    // paddingVertical: 2,
    // marginVertical: 5,
  },
  popupButton: {
    backgroundColor: '#6E757D',
    height: '20%',
    width: '50vw',
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  popupPickerHolder: {
    height: '40%',
    justifyContent: 'space-around',
  },
  precallControls: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 10,
    marginBottom: '2vh',
    width: '20%',
    justifyContent: 'space-around'
  },
  precallPickers: {
    height: '15%',
    justifyContent: 'space-evenly',
    padding: 0,
    margin: 0,
  },
  precallButton: {
    backgroundColor: '#6E757D',
    height: 50,
    width: '50vw',
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: '5vh',
  },
  precallButtonDisabled: {
    backgroundColor: '#6E757D',
    opacity: .3,
    height: 50,
    width: '50vw',
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    marginBottom: '5vh',
  }
};

export default styles;

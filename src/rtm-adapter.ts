import RtmEngine from 'agora-react-native-rtm';
import events from 'events';
const {EventEmitter} = events;

const APP_ID = '9383ec2f56364d478cefc38b0a37d8bc';

export default class RtmAdapter extends EventEmitter {
  public readonly client: RtmEngine;
  public uid: string | any;

  constructor(props: any) {
    super(props);
    this.uid = null;
    this.client = new RtmEngine();
    const eventsArray = [
      'error',
      'messageReceived',
      'channelMessageReceived',
      'channelMemberJoined',
      'channelMemberLeft',
      'tokenExpired',
      'connectionStateChanged',
    ];

    eventsArray.forEach((event: any) => {
      this.client.on(event, (evt: any) => {
        this.emit(event, evt);
      });
    });
  }

  async login(uid: string): Promise<any> {
    this.client.createClient(APP_ID);
    // this.client.setSdkLog("/storage/emulated/0/log.txt", 15, 100)
    //   .then((e) => console.log("log callback: ", e))
    //     .catch((e) => console.log("log error: ", e));
    this.uid = uid;
    return this.client.login({
      uid: this.uid,
    });
  }

  async logout(): Promise<any> {
    // await this.client.logout()
    return this.client.logout();
    // this.destroy()
    // return;
  }

  async join(cid: string): Promise<any> {
    return this.client.joinChannel(cid);
  }

  async leave(cid: string): Promise<any> {
    return this.client.leaveChannel(cid);
  }

  // eslint-disable-next-line prettier/prettier
  async sendChannelMessage(param: { channel: string, message: string }): Promise<any> {
    return this.client.sendMessageByChannelId(param.channel, param.message);
  }

  destroy() {
    this.client.destroyClient();
  }
}

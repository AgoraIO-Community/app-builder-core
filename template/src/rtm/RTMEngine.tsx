import RtmEngine from 'agora-react-native-rtm';

class RTMEngine {
  engine!: RtmEngine;
  private static _instance: RTMEngine | null = null;

  public static getInstance() {
    if (!RTMEngine._instance) {
      return new RTMEngine();
    }
    return RTMEngine._instance;
  }

  private async createClientInstance() {
    await this.engine.createClient($config.APP_ID);
  }

  private constructor() {
    if (RTMEngine._instance) {
      return RTMEngine._instance;
    }
    RTMEngine._instance = this;
    this.engine = new RtmEngine();
    this.createClientInstance();
    return RTMEngine._instance;
  }
}

export default RTMEngine;

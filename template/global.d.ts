/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
// import statements are not allowed in global configs
type VideoProfilePreset =
  | '120p_1'
  | '120p_3'
  | '180p_1'
  | '180p_3'
  | '180p_4'
  | '240p_1'
  | '240p_3'
  | '240p_4'
  | '360p_1'
  | '360p_3'
  | '360p_4'
  | '360p_6'
  | '360p_7'
  | '360p_8'
  | '360p_9'
  | '360p_10'
  | '360p_11'
  | '480p_1'
  | '480p_2'
  | '480p_3'
  | '480p_4'
  | '480p_6'
  | '480p_8'
  | '480p_9'
  | '480p_10'
  | '720p_1'
  | '720p_2'
  | '720p_3'
  | '720p_5'
  | '720p_6';

type ScreenShareProfilePreset =
  | '480p_1'
  | '480p_2'
  | '480p_3'
  | '720p'
  | '720p_1'
  | '720p_2'
  | '720p_3'
  | '1080p'
  | '1080p_1'
  | '1080p_2'
  | '1080p_3';

interface AudioEncoderConfiguration {
  /**
   * Sample rate of the audio (Hz).
   */
  sampleRate?: number;
  /**
   * Sample size of the audio.
   */
  sampleSize?: number;
  /**
   * Whether to enable stereo.
   */
  stereo?: boolean;
  /**
   * Bitrate of the audio (Kbps).
   */
  bitrate?: number;
}

declare const AUDIO_ENCODER_CONFIG_SETTINGS: {
  speech_low_quality: AudioEncoderConfiguration;
  speech_standard: AudioEncoderConfiguration;
  music_standard: AudioEncoderConfiguration;
  standard_stereo: AudioEncoderConfiguration;
  high_quality: AudioEncoderConfiguration;
  high_quality_stereo: AudioEncoderConfiguration;
};

type AudioEncoderConfigurationPreset =
  keyof typeof AUDIO_ENCODER_CONFIG_SETTINGS;

interface ConfigInterface {
  PRODUCT_ID: string;
  APP_NAME: string;
  LOGO: string;
  APP_ID: string;
  FRONTEND_ENDPOINT: string;
  BACKEND_ENDPOINT: string;
  PSTN: boolean;
  PRECALL: boolean;
  CHAT: boolean;
  CLOUD_RECORDING: boolean;
  RECORDING_MODE: 'WEB' | 'MIX';
  SCREEN_SHARING: boolean;
  CLIENT_ID: string;
  LANDING_SUB_HEADING: string;
  ENCRYPTION_ENABLED: boolean;
  PROFILE: VideoProfilePreset;
  SCREEN_SHARE_PROFILE: ScreenShareProfilePreset;
  ENABLE_GOOGLE_OAUTH: boolean;
  ENABLE_SLACK_OAUTH: boolean;
  ENABLE_MICROSOFT_OAUTH: boolean;
  ENABLE_APPLE_OAUTH: boolean;
  GOOGLE_CLIENT_ID: string;
  MICROSOFT_CLIENT_ID: string;
  SLACK_CLIENT_ID: string;
  APPLE_CLIENT_ID: string;
  EVENT_MODE: boolean;
  RAISE_HAND: boolean;
  GEO_FENCING: boolean;
  GEO_FENCING_INCLUDE_AREA: string;
  GEO_FENCING_EXCLUDE_AREA: string;
  LOG_ENABLED: boolean;
  AUDIO_ROOM: boolean;
  PRIMARY_ACTION_BRAND_COLOR: string;
  PRIMARY_ACTION_TEXT_COLOR: string;
  SECONDARY_ACTION_COLOR: string;
  FONT_COLOR: string;
  BG: string;
  BACKGROUND_COLOR: string;
  VIDEO_AUDIO_TILE_COLOR: string;
  VIDEO_AUDIO_TILE_OVERLAY_COLOR: string;
  VIDEO_AUDIO_TILE_TEXT_COLOR: string;
  VIDEO_AUDIO_TILE_AVATAR_COLOR: string;
  SEMANTIC_ERROR: string;
  SEMANTIC_SUCCESS: string;
  SEMANTIC_WARNING: string;
  SEMANTIC_NEUTRAL: string;
  INPUT_FIELD_BACKGROUND_COLOR: string;
  INPUT_FIELD_BORDER_COLOR: string;
  CARD_LAYER_1_COLOR: string;
  CARD_LAYER_2_COLOR: string;
  CARD_LAYER_3_COLOR: string;
  CARD_LAYER_4_COLOR: string;
  CARD_LAYER_5_COLOR: string;
  HARD_CODED_BLACK_COLOR: string;
  ICON_TEXT: boolean;
  ICON_BG_COLOR: string;
  TOOLBAR_COLOR: string;
  ACTIVE_SPEAKER: boolean;
  // TOAST_NOTIFICATIONS: boolean;
  ENABLE_TOKEN_AUTH: boolean;
  ENABLE_IDP_AUTH: boolean;
  PROJECT_ID: string;
  ENABLE_STT: boolean;
  ENABLE_CAPTION: boolean;
  ENABLE_MEETING_TRANSCRIPT: boolean;
  ENABLE_NOISE_CANCELLATION: boolean;
  ENABLE_VIRTUAL_BACKGROUND: boolean;
  ENABLE_WHITEBOARD: boolean;
  ENABLE_WHITEBOARD_FILE_UPLOAD: boolean;
  ENABLE_WAITING_ROOM: boolean;
  WHITEBOARD_APPIDENTIFIER: string;
  WHITEBOARD_REGION: string;
  CHAT_ORG_NAME: string;
  CHAT_APP_NAME: string;
  CHAT_URL: string;
  ENABLE_NOISE_CANCELLATION_BY_DEFAULT: boolean;
  NOISE_CANCELLATION_WASM_PATH: string;
  CLI_VERSION: string;
  CORE_VERSION: string;
  DISABLE_LANDSCAPE_MODE: boolean;
  STT_AUTO_START: boolean;
  CLOUD_RECORDING_AUTO_START: boolean;
  ENABLE_SPOTLIGHT: boolean;
  AUTO_CONNECT_RTM: boolean;
  ENABLE_CONVERSATIONAL_AI: boolean;
  CUSTOMIZE_AGENT: boolean;
  AI_LAYOUT: string;
  SDK_CODEC: string;
  ENABLE_WAITING_ROOM_AUTO_APPROVAL: boolean;
  ENABLE_WAITING_ROOM_AUTO_REQUEST: boolean;
  ENABLE_TEXT_TRACKS: boolean;
}
declare var $config: ConfigInterface;
declare module 'customization' {
  const customizationConfig: {};
  export default customizationConfig;
}
